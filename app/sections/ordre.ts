// Ordre des sections et libellés de navigation — source unique.
//
// N'importe aucun composant, volontairement : les sections y lisent leur numéro
// sans créer le cycle BaseSection → registre → sections.

export interface OrdreSection {
  /** Ancre de la section ; doit correspondre à l'id rendu par le composant. */
  id: string
  /** Libellé dans le menu ; omis = section absente de la navigation. */
  nav?: string
}

/** Déplacer une entrée réordonne la page, la navigation et la numérotation. */
export const ordreSections: OrdreSection[] = [
  { id: 'accueil' },
  // Projets avant Parcours : montrer ce qui a été construit avant la
  // chronologie scolaire.
  { id: 'projets', nav: 'Projets' },
  { id: 'parcours', nav: 'Parcours' },
  { id: 'competences', nav: 'Compétences' },
  { id: 'contact', nav: 'Contact' },
]

/** Liens dérivés pour la navigation. */
export const liensNavigation = ordreSections
  .filter(s => s.nav)
  .map(s => ({ href: `#${s.id}`, label: s.nav! }))

/**
 * Numéro affiché devant l'intitulé, sur deux chiffres. Le hero est exclu : il
 * n'a pas d'intitulé.
 *
 * @example
 * numeroSection('parcours') // '02'
 */
export function numeroSection(id: string): string {
  const rang = ordreSections.filter(s => s.nav).findIndex(s => s.id === id)
  return rang === -1 ? '' : String(rang + 1).padStart(2, '0')
}
