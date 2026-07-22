// ============================================================
// Schéma du contenu du portfolio.
// Les interfaces vivent ici, les données dans app/content/.
// Séparer les deux garde chaque fichier de contenu court et permet de faire
// évoluer le schéma (nouveau champ, nouvelle section) sans toucher au contenu.
// ============================================================
import type { DemoId } from '~/demos'

/** Un lien externe (code, démo en ligne, rapport…). */
export interface LienExterne {
  label: string
  url: string
}

/** Bloc d'identité affiché dans le hero, le contact et le pied de page. */
export interface Profil {
  nom: string
  titre: string
  statut: string
  accroche: string
  email: string
  github: string
  linkedin: string
  localisation: string
  cv: string
}

/** Une étape de la timeline formation / expérience. */
export interface EtapeParcours {
  periode: string
  titre: string
  lieu: string
  description: string
}

/** Catégories de projets — source unique du type et des filtres. */
export const categoriesProjet = ['Web', 'Backend & DevOps', 'Réseaux & Sécurité'] as const
export type CategorieProjet = (typeof categoriesProjet)[number]

/** Un projet du portfolio. */
export interface Projet {
  titre: string
  sousTitre: string
  description: string
  tags: string[]
  categorie: CategorieProjet
  liens?: LienExterne[]
  // Identifiant d'une démo interactive embarquée (registre : app/demos).
  demo?: DemoId
}

/** Une carte de compétences, groupée par sous-thème. */
export interface GroupeCompetences {
  titre: string
  groupes: { label: string, items: string[] }[]
}
