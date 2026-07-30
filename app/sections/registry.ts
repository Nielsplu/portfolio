// ============================================================
// Registre des sections du portfolio — source unique de l'ordre d'affichage
// ET de la navigation.
//
// Pour ajouter une section (ex. « Blog », « Open source ») :
//   1. créer app/components/sections/<Nom>Section.vue
//   2. l'importer et l'ajouter à ce tableau, à la position voulue
// Elle apparaît alors dans la page et — si `nav` est défini — dans le menu,
// sans toucher ni la page ni le composant de navigation.
// ============================================================
import type { Component } from 'vue'
import CompetencesSection from '~/components/sections/CompetencesSection.vue'
import ContactSection from '~/components/sections/ContactSection.vue'
import HeroSection from '~/components/sections/HeroSection.vue'
import ParcoursSection from '~/components/sections/ParcoursSection.vue'
import ProjetsSection from '~/components/sections/ProjetsSection.vue'

export interface Section {
  /** Ancre de la section ; doit correspondre à l'id rendu par le composant. */
  id: string
  /** Libellé dans le menu ; omis = section absente de la navigation. */
  nav?: string
  component: Component
}

export const sections: Section[] = [
  { id: 'accueil', component: HeroSection },
  // Projets avant Parcours : un recruteur veut voir ce qui a été construit
  // avant de lire une chronologie scolaire. L'ordre de la navigation suit
  // automatiquement, ce tableau en étant l'unique source.
  { id: 'projets', nav: 'Projets', component: ProjetsSection },
  { id: 'parcours', nav: 'Parcours', component: ParcoursSection },
  { id: 'competences', nav: 'Compétences', component: CompetencesSection },
  { id: 'contact', nav: 'Contact', component: ContactSection },
]

/** Liens dérivés pour la navigation (sections portant un libellé `nav`). */
export const liensNavigation = sections
  .filter(s => s.nav)
  .map(s => ({ href: `#${s.id}`, label: s.nav! }))

/**
 * Numéro d'ordre affiché devant l'intitulé d'une section, sur deux chiffres.
 *
 * Dérivé de ce tableau et non écrit en dur : réordonner les sections renumérote
 * tout automatiquement, comme la navigation. Le hero est exclu du décompte —
 * il n'a pas d'intitulé et numéroter une page d'accueil n'aurait pas de sens.
 *
 * @example
 * numeroSection('parcours') // '02', puisque Projets vient avant
 */
export function numeroSection(id: string): string {
  const rang = sections.filter(s => s.nav).findIndex(s => s.id === id)
  return rang === -1 ? '' : String(rang + 1).padStart(2, '0')
}
