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
  /** Étape toujours en cours. La date de fin d'un diplôme en préparation se lit
   *  comme une date passée : ce drapeau lève l'ambiguïté d'un coup d'œil. */
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
  /** Accroche affichée dans le bandeau qui met la démo en avant, en tête de la
   *  section projets. Sans elle, la démo n'est découvrable qu'en lisant la
   *  sixième carte jusqu'au bout. */
  demoAccroche?: string
  /** Dépôt volontairement privé : la carte l'indique explicitement plutôt que
   *  de n'afficher aucun lien, ce qui laisserait croire à un oubli. */
  codePrive?: boolean
  /** Points de détail dépliables sur la carte : contexte, décisions techniques,
   *  difficultés rencontrées. Ce qui distingue quelqu'un qui a fait le travail
   *  de quelqu'un qui a listé des technologies.
   *  Absent, la carte ne propose simplement pas de dépliant. */
  details?: string[]
}

/** Une entrée de compétence. Une simple chaîne dans la majorité des cas ; la
 *  forme longue sert à ce qui peut être prouvé — une certification et son
 *  justificatif consultable. */
export type ItemCompetence = string | {
  label: string
  /** Chemin ou URL du justificatif. Le jeton devient alors un lien : une
   *  certification qu'on ne peut pas vérifier ne vaut pas grand-chose. */
  justificatif: string
}

/** Ramène une entrée à sa forme longue, pour un rendu uniforme. */
export function normaliserItem(item: ItemCompetence): { label: string, justificatif?: string } {
  return typeof item === 'string' ? { label: item } : item
}

/** Une carte de compétences, groupée par sous-thème. */
export interface GroupeCompetences {
  titre: string
  groupes: { label: string, items: ItemCompetence[] }[]
}
