// ============================================================
// Toutes les données du portfolio sont ici.
// Modifie ce fichier, le site se met à jour tout seul.
// ============================================================
import type { DemoId } from '~/demos'

export const profil = {
  nom: 'Niels Plu',
  titre: 'Développeur — BUT Informatique',
  statut: "Étudiant en 3ᵉ année de BUT Informatique · IUT de Nantes",
  accroche:
    "Étudiant en 3ᵉ année de BUT Informatique, je conçois des applications web de bout en bout : back-end, base de données, front-end et déploiement. Rigoureux et curieux, je cherche à progresser au contact d'équipes exigeantes.",
  email: 'pluniels@gmail.com',
  github: 'https://github.com/Nielsplu',
  linkedin: 'https://www.linkedin.com/in/niels-plu-389ba12a2/',
  localisation: 'Petit-Mars (44) — Nantes',
  cv: 'cv/CV_Niels_PLU.pdf',
}

export interface EtapeParcours {
  periode: string
  titre: string
  lieu: string
  description: string
}

export const parcours: EtapeParcours[] = [
  {
    periode: '2024 – 2027',
    titre: 'BUT Informatique',
    lieu: 'IUT de Nantes',
    description:
      "Développement web et logiciel, bases de données, systèmes et réseaux. Projets en équipe menés en conditions réelles (Git, CI/CD, conteneurs).",
  },
  {
    periode: 'Avril – Juillet 2026',
    titre: 'Stage développement — pôle IDP',
    lieu: 'AEROW, Nantes',
    description:
      "Création complète d'une solution de traitement documentaire intelligent : architecture microservices (Clean Architecture, BFF), API métier, interfaces utilisateurs, intégration IA (OCR / Agents), sécurisation JWT, TDD. ~60 routes API, 163 tests unitaires, 11 conteneurs Docker.",
  },
  {
    periode: 'Juin – Juillet 2025',
    titre: 'Technicien de maintenance système et réseau',
    lieu: 'AKOS, Treillières',
    description:
      'Maintenance et support des systèmes et du réseau au sein du service informatique.',
  },
  {
    periode: 'Avril – Mai 2024',
    titre: "Stage d'observation — service informatique",
    lieu: 'UGECAM Nord-Est, Nancy',
    description:
      'Découverte du métier et consolidation de mon projet professionnel.',
  },
  {
    periode: '2021 – 2024',
    titre: 'Baccalauréat Général — Mention Bien',
    lieu: 'Lycée Caroline Aigle, Nort-sur-Erdre',
    description: 'Spécialités Mathématiques et NSI.',
  },
]

// Source unique pour les catégories : le type ET les filtres de la page projets
// (SectionProjets.vue) en dérivent, pour ne jamais désynchroniser les deux.
export const categoriesProjet = ['Web', 'Backend & DevOps', 'Réseaux & Sécurité'] as const
export type CategorieProjet = (typeof categoriesProjet)[number]

// Un projet peut exposer plusieurs liens (code, démo en ligne, rapport…).
// N'ajouter que des URLs accessibles sans compte : un lien qui tombe sur une
// page de login GitLab ou un 404 GitHub dessert plus qu'il ne sert.
export interface ProjetLien {
  label: string
  url: string
}

export interface Projet {
  titre: string
  sousTitre: string
  description: string
  tags: string[]
  categorie: CategorieProjet
  liens?: ProjetLien[]
  // Identifiant d'une démo interactive embarquée (registre : app/demos).
  demo?: DemoId
}

export const projets: Projet[] = [
  {
    titre: 'Warhammer 40k Army Builder',
    sousTitre: 'Projet personnel',
    description:
      "Application web de création de listes d'armées avec moteur de règles complet : validation en temps réel (règle de 3, quotas de détachement, personnages nommés), résolution automatique des armes, transports et export imprimable. Architecture Nuxt 4 en layers, TypeScript strict, tests Vitest, CI/CD GitHub Actions, Gitleaks.",
    tags: ['Nuxt 4', 'Vue 3', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Prisma', 'Vitest', 'GitHub Actions'],
    categorie: 'Web',
    // Repo actuellement privé sur GitHub : le passer en public (ou déployer
    // une démo) avant de décommenter, sinon les visiteurs tombent sur un 404.
    // liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/Warhammer' }],
  },
  {
    titre: 'Solution de traitement documentaire intelligent',
    sousTitre: 'Stage AEROW — pôle IDP',
    description:
      "Conception et développement d'une plateforme de collecte et d'analyse documentaire : microservices en Clean Architecture, API métier, front Next.js, intégration IA (OCR / Agents), sécurisation JWT et tests unitaires en TDD.",
    tags: ['.NET 10', 'ASP.NET Core', 'PostgreSQL', 'Dapper', 'Next.js 15', 'React', 'Docker', 'Traefik'],
    categorie: 'Backend & DevOps',
  },
  {
    titre: 'Site web marchand',
    sousTitre: 'Projet universitaire',
    description:
      "Développement d'un site e-commerce en PHP (CodeIgniter 4) : architecture MVC, migrations et seeders de base de données, interface responsive, conteneurisation Podman et documentation technique Sphinx.",
    tags: ['PHP', 'CodeIgniter 4', 'MVC', 'Podman', 'Sphinx'],
    categorie: 'Web',
    liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/site-marchand-codeigniter' }],
  },
  {
    titre: 'Plateforme microservices',
    sousTitre: 'Projet universitaire',
    description:
      "Monorepo de 4 microservices Node.js — authentification, API gateway / proxy, collecte automatique de flux RSS et stockage — avec MongoDB, pipeline CI/CD GitLab, tests unitaires et d'intégration et documentation Swagger.",
    tags: ['Node.js', 'MongoDB', 'Docker', 'CI/CD GitLab', 'Swagger', 'Turbo'],
    categorie: 'Backend & DevOps',
  },
  {
    titre: 'Infrastructure réseau sécurisée',
    sousTitre: 'Projet universitaire',
    description:
      "Conception et déploiement d'un réseau complet : VLAN, DHCP, DNS (Bind9) avec délégation, serveur web Apache, synchronisation NTP et pare-feu iptables en politique de moindre privilège avec NAT.",
    tags: ['VLAN', 'DHCP', 'Bind9', 'Apache', 'iptables', 'NAT'],
    categorie: 'Réseaux & Sécurité',
    liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/sae-reseaux' }],
  },
  {
    titre: 'Serveur et client FTP en Go',
    sousTitre: 'Projet universitaire',
    description:
      "Implémentation d'un protocole de transfert de fichiers : envoi par chunks pour les gros fichiers, gestion de la concurrence et des race conditions via un design pattern « Stopper » maison, timeout des connexions inactives et sécurisation de l'arborescence servie.",
    tags: ['Go', 'Concurrence', 'Réseau', 'CLI'],
    categorie: 'Réseaux & Sécurité',
    demo: 'ftp',
    liens: [
      { label: 'Code', url: 'https://github.com/Nielsplu/ftp-go' },
      { label: 'Binaires', url: 'https://github.com/Nielsplu/ftp-go/releases/tag/v1.0' },
    ],
  },
]

export interface GroupeCompetences {
  titre: string
  groupes: { label: string, items: string[] }[]
}

export const competences: GroupeCompetences[] = [
  {
    titre: 'Langages',
    groupes: [
      { label: 'Back-end', items: ['C#', 'Go', 'PHP', 'Python', 'SQL'] },
      { label: 'Front-end', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    ],
  },
  {
    titre: 'Web & frameworks',
    groupes: [
      { label: 'Back', items: ['.NET / ASP.NET Core', 'Node.js', 'CodeIgniter 4'] },
      { label: 'Front', items: ['Nuxt / Vue 3', 'Next.js / React', 'Tailwind'] },
      { label: 'Données', items: ['PostgreSQL', 'MongoDB', 'Prisma', 'Dapper'] },
    ],
  },
  {
    titre: 'Outils & DevOps',
    groupes: [
      { label: 'Conteneurs & CI', items: ['Docker', 'Podman', 'Traefik', 'GitHub Actions', 'CI/CD GitLab'] },
      { label: 'Qualité', items: ['Vitest', 'TDD', 'ESLint', 'Gitleaks'] },
      { label: 'Automatisation', items: ['Make.com'] },
    ],
  },
  {
    titre: 'Certifications & langues',
    groupes: [
      { label: 'Certifications', items: ['Make Certified Expert', 'Make.com AI Agents'] },
      { label: 'Langues', items: ['Français (natif)', 'Anglais', 'Espagnol'] },
      { label: 'Divers', items: ['Permis B'] },
    ],
  },
]
