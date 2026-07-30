// ============================================================
// Ordre des sections et libellés de navigation — SOURCE UNIQUE.
//
// Ce module ne connaît volontairement aucun composant. Le registre
// (registry.ts) y associe les composants Vue ; les composants de section, eux,
// n'importent que ce fichier pour connaître leur numéro d'ordre.
//
// Sans cette séparation, BaseSection importerait le registre, qui importe les
// sections, qui importent BaseSection : un cycle qui casse au chargement
// (« Cannot access CompetencesSection before initialization »).
// ============================================================

/** Une entrée d'ordre : l'ancre, et le libellé de navigation s'il y en a un. */
export interface OrdreSection {
  /** Ancre de la section ; doit correspondre à l'id rendu par le composant. */
  id: string
  /** Libellé dans le menu ; omis = section absente de la navigation. */
  nav?: string
}

/**
 * Ordre d'affichage des sections. Déplacer une entrée ici réordonne la page,
 * la navigation et la numérotation d'un seul coup.
 */
export const ordreSections: OrdreSection[] = [
  { id: 'accueil' },
  // Projets avant Parcours : un recruteur veut voir ce qui a été construit
  // avant de lire une chronologie scolaire.
  { id: 'projets', nav: 'Projets' },
  { id: 'parcours', nav: 'Parcours' },
  { id: 'competences', nav: 'Compétences' },
  { id: 'contact', nav: 'Contact' },
]

/** Liens dérivés pour la navigation (sections portant un libellé `nav`). */
export const liensNavigation = ordreSections
  .filter(s => s.nav)
  .map(s => ({ href: `#${s.id}`, label: s.nav! }))

/**
 * Numéro d'ordre affiché devant l'intitulé d'une section, sur deux chiffres.
 *
 * Dérivé de la liste ci-dessus et non écrit en dur : réordonner renumérote tout
 * automatiquement. Le hero est exclu du décompte — il n'a pas d'intitulé, et
 * numéroter une page d'accueil n'aurait pas de sens.
 *
 * @example
 * numeroSection('parcours') // '02', puisque Projets vient avant
 */
export function numeroSection(id: string): string {
  const rang = ordreSections.filter(s => s.nav).findIndex(s => s.id === id)
  return rang === -1 ? '' : String(rang + 1).padStart(2, '0')
}
