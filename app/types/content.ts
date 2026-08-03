// Schéma du contenu. Les interfaces ici, les données dans app/content/.
import type { DemoId } from '~/demos'
import type { SchemaId } from '~/schemas'

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
  /** « 2024 – 2027 » se lit comme une période révolue : ce drapeau l'évite. */
  enCours?: boolean
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
  /** Accroche du bandeau qui met la démo en avant, en tête de section. */
  demoAccroche?: string
  /** Dépôt privé : la carte l'indique, plutôt que de n'afficher aucun lien. */
  codePrive?: boolean
  /**
   * Schéma technique montré dans la fiche (registre : app/schemas). Pour les
   * projets qu'on ne peut pas « visiter » — une infrastructure réseau n'a pas
   * d'URL.
   */
  schema?: SchemaId
  /** Détails montrés dans la fiche : contexte, décisions, difficultés. */
  details?: string[]
  /** Captures montrées dans la fiche. */
  images?: ImageProjet[]
}

/** Une image de la galerie d'un projet. */
export interface ImageProjet {
  src: string
  /** Obligatoire : sans elle la capture n'existe pas pour une partie des
   *  visiteurs. */
  alt: string
  /** Légende affichée sous l'image. */
  legende?: string
}

/** Une chaîne suffit ; la forme longue sert aux certifications prouvables. */
export type ItemCompetence = string | {
  label: string
  /** Chemin du justificatif : le jeton devient alors un lien. */
  justificatif: string
}

/** Ramène une entrée à sa forme longue. */
export function normaliserItem(item: ItemCompetence): { label: string, justificatif?: string } {
  return typeof item === 'string' ? { label: item } : item
}

/** Une carte de compétences, groupée par sous-thème. */
export interface GroupeCompetences {
  titre: string
  groupes: { label: string, items: ItemCompetence[] }[]
}
