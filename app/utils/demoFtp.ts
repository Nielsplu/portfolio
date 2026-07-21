// Moteur de la démo FTP embarquée dans le portfolio. Reproduit en mémoire le
// comportement du vrai client/serveur (github.com/Nielsplu/ftp-go) : mêmes
// commandes, même arborescence data/ que celle servie par le binaire.
// Module pur (aucune I/O) : l'affichage, les téléchargements et le timeout
// d'inactivité sont gérés par le composant DemoFtpTerminal.

export type EntreeDemo =
  | { type: 'fichier', taille: number, contenu?: string, cache?: boolean }
  | { type: 'dossier', enfants: Record<string, EntreeDemo> }

export interface EtatDemo {
  racine: Extract<EntreeDemo, { type: 'dossier' }>
  chemin: string[]
}

export interface Telechargement {
  nom: string
  taille: number
  contenu?: string
}

export interface ResultatCommande {
  lignes: string[]
  telechargement?: Telechargement
  deconnexion?: 'end' | 'terminate'
}

// Au-delà de ce seuil, le vrai serveur envoie le fichier chunk par chunk :
// le composant anime une barre de progression pour ces fichiers-là.
export const SEUIL_GROS_FICHIER = 1 << 20

export const AIDE = [
  'Commandes disponibles :',
  '  List              liste le dossier courant',
  '  Cd <dossier>      change de dossier (Cd .. pour remonter, Cd seul pour la racine)',
  '  Get <fichier>     télécharge un fichier (chunk par chunk au-delà de 1 Mio)',
  '  Hide <fichier>    masque un fichier côté serveur',
  '  Reveal <fichier>  ré-affiche un fichier masqué',
  '  End               ferme la session',
  '  Terminate         arrête le serveur (arrêt gracieux via les Stoppers)',
]

// Copie de l'arborescence data/ réellement servie par le binaire de la
// release v1.0 (tailles réelles).
export function creerEtat(): EtatDemo {
  return {
    chemin: [],
    racine: {
      type: 'dossier',
      enfants: {
        'Moveto': { type: 'dossier', enfants: {} },
        'important': {
          type: 'dossier',
          enfants: {
            'test': {
              type: 'dossier',
              enfants: {
                'oui.md': { type: 'fichier', taille: 98 },
              },
            },
            'test.txt': { type: 'fichier', taille: 8331 },
          },
        },
        'zab.txt': { type: 'fichier', taille: 9, contenu: 'Salut man' },
        'zib.txt': { type: 'fichier', taille: 38774568 },
        'zub.txt': { type: 'fichier', taille: 62145 },
      },
    },
  }
}

export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1).replace('.', ',')} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

function dossierCourant(etat: EtatDemo): Extract<EntreeDemo, { type: 'dossier' }> {
  let dossier = etat.racine
  for (const segment of etat.chemin) {
    const suivant = dossier.enfants[segment]
    if (suivant?.type !== 'dossier') break
    dossier = suivant
  }
  return dossier
}

export function invite(etat: EtatDemo): string {
  return `data/${etat.chemin.map(s => `${s}/`).join('')}`
}

export function executerCommande(etat: EtatDemo, saisie: string): ResultatCommande {
  const [commande, ...args] = saisie.trim().split(/\s+/)
  const argument = args.join(' ')
  const courant = dossierCourant(etat)

  switch ((commande ?? '').toLowerCase()) {
    case '':
      return { lignes: [] }

    case 'help':
      return { lignes: AIDE }

    case 'list': {
      const entrees = Object.entries(courant.enfants)
        .filter(([, e]) => !(e.type === 'fichier' && e.cache))
        .sort(([a], [b]) => a.localeCompare(b))
      if (entrees.length === 0) return { lignes: ['(dossier vide)'] }
      return {
        lignes: entrees.map(([nom, e]) =>
          e.type === 'dossier' ? `${nom}/` : `${nom.padEnd(16)}${formatTaille(e.taille).padStart(9)}`,
        ),
      }
    }

    case 'cd': {
      if (!argument) {
        etat.chemin = []
        return { lignes: ['Retour à la racine.'] }
      }
      if (argument === '..') {
        if (etat.chemin.length === 0) return { lignes: ['Déjà à la racine du serveur.'] }
        etat.chemin.pop()
        return { lignes: [`Dossier courant : ${invite(etat)}`] }
      }
      const cible = courant.enfants[argument]
      if (cible?.type !== 'dossier') return { lignes: [`Dossier introuvable : ${argument}`] }
      etat.chemin.push(argument)
      return { lignes: [`Dossier courant : ${invite(etat)}`] }
    }

    case 'get': {
      if (!argument) return { lignes: ['Usage : Get <fichier>'] }
      const cible = courant.enfants[argument]
      if (cible?.type !== 'fichier' || cible.cache)
        return { lignes: [`Fichier introuvable : ${argument}`] }
      return {
        lignes: [],
        telechargement: { nom: argument, taille: cible.taille, contenu: cible.contenu },
      }
    }

    case 'hide': {
      if (!argument) return { lignes: ['Usage : Hide <fichier>'] }
      const cible = courant.enfants[argument]
      if (cible?.type !== 'fichier' || cible.cache)
        return { lignes: [`Fichier introuvable : ${argument}`] }
      cible.cache = true
      return { lignes: [`${argument} est maintenant masqué (persisté dans hiddenFile.txt).`] }
    }

    case 'reveal': {
      if (!argument) return { lignes: ['Usage : Reveal <fichier>'] }
      const cible = courant.enfants[argument]
      if (cible?.type !== 'fichier' || !cible.cache)
        return { lignes: [`Aucun fichier masqué nommé : ${argument}`] }
      cible.cache = false
      return { lignes: [`${argument} est de nouveau visible.`] }
    }

    case 'end':
      return { lignes: ['Session fermée. (ok)'], deconnexion: 'end' }

    case 'terminate':
      return {
        lignes: [
          'Arrêt du serveur demandé…',
          'stopper: signal envoyé aux enfants (accept loops, readers, writers)',
          'stopper: tous les enfants terminés proprement',
          'Serveur arrêté. (ok)',
        ],
        deconnexion: 'terminate',
      }

    default:
      return { lignes: [`Commande inconnue : ${commande}. Tapez "help".`] }
  }
}
