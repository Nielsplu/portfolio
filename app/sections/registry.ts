// ============================================================
// Registre des sections : associe chaque entrée d'ordre à son composant.
//
// L'ordre lui-même, les libellés de navigation et la numérotation vivent dans
// ./ordre.ts, qui n'importe aucun composant. Cette séparation est délibérée :
// les composants de section lisent leur numéro dans ce module-là, ce qui évite
// le cycle BaseSection → registre → sections → BaseSection.
//
// Pour ajouter une section (ex. « Blog », « Open source ») :
//   1. créer app/components/sections/<Nom>Section.vue
//   2. ajouter son id à `ordreSections` dans ./ordre.ts, à la position voulue
//   3. l'associer à son composant ci-dessous
// Elle apparaît alors dans la page et — si `nav` est défini — dans le menu.
// ============================================================
import type { Component } from 'vue'
import CompetencesSection from '~/components/sections/CompetencesSection.vue'
import ContactSection from '~/components/sections/ContactSection.vue'
import HeroSection from '~/components/sections/HeroSection.vue'
import ParcoursSection from '~/components/sections/ParcoursSection.vue'
import ProjetsSection from '~/components/sections/ProjetsSection.vue'
import { ordreSections } from './ordre'

/** Composant à monter pour chaque ancre. */
const composants: Record<string, Component> = {
  accueil: HeroSection,
  projets: ProjetsSection,
  parcours: ParcoursSection,
  competences: CompetencesSection,
  contact: ContactSection,
}

export interface Section {
  id: string
  nav?: string
  component: Component
}

/** Sections à rendre, dans l'ordre déclaré par ./ordre.ts. */
export const sections: Section[] = ordreSections
  .filter(s => composants[s.id])
  .map(s => ({ ...s, component: composants[s.id]! }))

// Réexporté pour ne pas casser les imports existants ; la définition vit dans
// ./ordre.ts, avec le reste de ce qui dérive de l'ordre.
export { liensNavigation, numeroSection } from './ordre'
