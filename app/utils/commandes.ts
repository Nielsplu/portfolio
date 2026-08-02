import type { DemoId } from '~/demos'
import type { Profil, Projet } from '~/types/content'
import { liensNavigation } from '~/sections/ordre'
import { versSlug } from '~/utils/slug'

// Descripteurs de la palette de commandes. Séparés du composant pour rester
// vérifiables : ce sont des données, l'exécution vit dans PaletteCommandes.

/** Ce que déclenche une commande. Le composant sait exécuter chaque variante. */
export type Action =
  | { type: 'ancre', href: string }
  | { type: 'fiche', slug: string }
  | { type: 'demo', id: DemoId }
  | { type: 'externe', url: string }
  | { type: 'fichier', chemin: string }
  | { type: 'copier', valeur: string }
  | { type: 'theme' }
  | { type: 'imprimer' }

export type GroupeCommande = 'Navigation' | 'Projets' | 'Actions'

export interface Commande {
  id: string
  libelle: string
  groupe: GroupeCommande
  /** Précision affichée en gris à droite du libellé. */
  detail?: string
  /**
   * Termes supplémentaires pris en compte par la recherche sans être affichés
   * — « mail » doit trouver « Copier l'adresse e-mail ».
   */
  synonymes?: string
  action: Action
}

/**
 * Construit la liste complète, dans l'ordre d'affichage à requête vide.
 *
 * @example
 * construireCommandes(projets, profil).find(c => c.id === 'nav-projets')
 */
export function construireCommandes(projets: readonly Projet[], profil: Profil): Commande[] {
  const navigation: Commande[] = liensNavigation.map(lien => ({
    id: `nav-${lien.href.slice(1)}`,
    libelle: `Aller à ${lien.label}`,
    groupe: 'Navigation',
    synonymes: lien.label,
    action: { type: 'ancre', href: lien.href },
  }))

  const fiches: Commande[] = projets.map(projet => ({
    id: `projet-${versSlug(projet.titre)}`,
    libelle: projet.titre,
    groupe: 'Projets',
    detail: projet.sousTitre,
    // Les technos rendent un projet trouvable par ce avec quoi il est fait.
    synonymes: projet.tags.join(' '),
    action: { type: 'fiche', slug: versSlug(projet.titre) },
  }))

  const demos: Commande[] = projets
    .filter(projet => projet.demo)
    .map(projet => ({
      id: `demo-${projet.demo!}`,
      libelle: `Lancer la démo — ${projet.titre}`,
      groupe: 'Projets',
      detail: 'dans le navigateur',
      synonymes: 'demo terminal essayer tester',
      action: { type: 'demo', id: projet.demo! },
    }))

  const actions: Commande[] = [
    {
      id: 'copier-email',
      libelle: 'Copier l\'adresse e-mail',
      groupe: 'Actions',
      detail: profil.email,
      synonymes: 'mail contact courriel',
      action: { type: 'copier', valeur: profil.email },
    },
    {
      id: 'cv',
      libelle: 'Ouvrir le CV',
      groupe: 'Actions',
      detail: 'PDF',
      synonymes: 'curriculum vitae pdf',
      action: { type: 'fichier', chemin: profil.cv },
    },
    {
      id: 'github',
      libelle: 'Ouvrir GitHub',
      groupe: 'Actions',
      detail: 'nouvel onglet',
      synonymes: 'code depot sources',
      action: { type: 'externe', url: profil.github },
    },
    {
      id: 'linkedin',
      libelle: 'Ouvrir LinkedIn',
      groupe: 'Actions',
      detail: 'nouvel onglet',
      synonymes: 'reseau professionnel',
      action: { type: 'externe', url: profil.linkedin },
    },
    {
      id: 'theme',
      libelle: 'Basculer le thème clair / sombre',
      groupe: 'Actions',
      synonymes: 'dark mode nuit jour',
      action: { type: 'theme' },
    },
    {
      id: 'imprimer',
      libelle: 'Imprimer la page',
      groupe: 'Actions',
      detail: 'ou export PDF',
      synonymes: 'pdf impression',
      action: { type: 'imprimer' },
    },
  ]

  return [...navigation, ...fiches, ...demos, ...actions]
}

/** Texte réellement soumis à la recherche : libellé, détail et synonymes. */
export function texteRecherchable(commande: Commande): string {
  return [commande.libelle, commande.detail, commande.synonymes].filter(Boolean).join(' ')
}
