// Complétion Tab du terminal de démo, calquée sur bash : un premier Tab étend
// la saisie jusqu'au plus long préfixe commun aux candidats, un second — qui
// n'ajoute donc plus rien — les liste.
// Module pur : l'affichage et la lecture du dossier courant sont à la charge
// de DemoFtpTerminal.

/** Contenu du dossier courant, tel que le serveur l'expose. */
export interface EntreesDossier {
  dossiers: string[]
  fichiers: string[]
  /** Masqués par Hide : seuls candidats de Reveal, exclus des autres. */
  masques: string[]
}

export interface Completion {
  /** Nouvelle valeur du champ, inchangée s'il n'y a rien à compléter. */
  saisie: string
  /** Candidats à afficher, non vide seulement quand le Tab n'ajoute rien. */
  candidats: string[]
}

/** Commandes du moteur de simulation, dans l'ordre d'affichage. */
export const COMMANDES_SIMULATION = ['Cd', 'End', 'Get', 'Help', 'Hide', 'List', 'Reveal', 'Terminate'] as const

/** Commandes du vrai serveur sur le port client (3333). */
export const COMMANDES_CLIENT = ['Cd', 'End', 'Get', 'Help', 'List'] as const

/** Commandes du vrai serveur sur le port admin (4444) : pas de Get. */
export const COMMANDES_ADMIN = ['Cd', 'End', 'Help', 'Hide', 'List', 'Reveal', 'Terminate'] as const

function prefixeCommun(mots: string[]): string {
  let prefixe = mots[0] ?? ''
  for (const mot of mots.slice(1)) {
    let i = 0
    while (i < prefixe.length && i < mot.length && prefixe[i] === mot[i]) i++
    prefixe = prefixe.slice(0, i)
  }
  return prefixe
}

/**
 * Candidats pour l'argument d'une commande. Les noms de fichiers suivent la
 * casse du système de fichiers ; ne rien proposer vaut mieux que proposer un
 * nom que le serveur refusera.
 */
function candidatsArgument(commande: string, entrees: EntreesDossier): string[] {
  switch (commande.toLowerCase()) {
    // `..` remonte d'un cran, comme dans le client natif.
    case 'cd': return [...entrees.dossiers, '..']
    case 'get': return entrees.fichiers
    case 'hide': return entrees.fichiers
    case 'reveal': return entrees.masques
    default: return []
  }
}

function appliquer(saisie: string, debut: string, fragment: string, candidats: string[]): Completion {
  if (candidats.length === 0) return { saisie, candidats: [] }

  const tries = [...candidats].sort((a, b) => a.localeCompare(b))
  // Candidat unique : on complète et on ouvre le mot suivant.
  if (tries.length === 1) return { saisie: `${debut}${tries[0]} `, candidats: [] }

  // Comparaison stricte et non sur la longueur : « h » devient « H » même sans
  // gagner un caractère, pour montrer la casse attendue par le serveur.
  const prefixe = prefixeCommun(tries)
  if (prefixe !== fragment) return { saisie: debut + prefixe, candidats: [] }
  // Le Tab n'apporte plus rien : c'est le second appui, on liste.
  return { saisie, candidats: tries }
}

/**
 * Complète le dernier mot de la saisie. Le premier mot est complété sur les
 * commandes (sans égard à la casse, comme les accepte le serveur), les
 * suivants sur le contenu du dossier courant.
 */
export function completer(
  saisie: string,
  entrees: EntreesDossier,
  commandes: readonly string[],
): Completion {
  const separation = saisie.lastIndexOf(' ') + 1
  const debut = saisie.slice(0, separation)
  const fragment = saisie.slice(separation)
  const mots = debut.trim() === '' ? [] : debut.trim().split(/\s+/)

  if (mots.length === 0) {
    const minuscule = fragment.toLowerCase()
    return appliquer(saisie, debut, fragment, commandes.filter(c => c.toLowerCase().startsWith(minuscule)))
  }

  // Aucune commande de la démo ne prend plus d'un argument.
  if (mots.length > 1) return { saisie, candidats: [] }

  const candidats = candidatsArgument(mots[0]!, entrees).filter(c => c.startsWith(fragment))
  return appliquer(saisie, debut, fragment, candidats)
}
