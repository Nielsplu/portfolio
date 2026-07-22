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
  { id: 'parcours', nav: 'Parcours', component: ParcoursSection },
  { id: 'projets', nav: 'Projets', component: ProjetsSection },
  { id: 'competences', nav: 'Compétences', component: CompetencesSection },
  { id: 'contact', nav: 'Contact', component: ContactSection },
]

/** Liens dérivés pour la navigation (sections portant un libellé `nav`). */
export const liensNavigation = sections
  .filter(s => s.nav)
  .map(s => ({ href: `#${s.id}`, label: s.nav! }))
