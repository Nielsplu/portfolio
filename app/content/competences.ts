import type { GroupeCompetences } from '~/types/content'

export const competences: GroupeCompetences[] = [
  {
    titre: 'Langages',
    groupes: [
      // « MySQL » plutôt que « SQL » : c'est le moteur réellement pratiqué, la
      // mention est plus précise pour un recruteur — et elle a un logo.
      { label: 'Back-end', items: ['C#', 'Go', 'PHP', 'Python', 'MySQL'] },
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
      { label: 'Qualité', items: ['Vitest', 'TDD', 'Stryker', 'ESLint', 'Gitleaks'] },
      { label: 'Automatisation', items: ['Make.com'] },
    ],
  },
  {
    titre: 'Certifications & langues',
    groupes: [
      {
        label: 'Certifications',
        items: [
          'Make Certified Expert',
          // Justificatif consultable : une certification invérifiable ne pèse
          // pas lourd auprès d'un recruteur.
          { label: 'Make.com AI Agents', justificatif: 'certifications/make-ai-agent-builder.pdf' },
        ],
      },
      { label: 'Langues', items: ['Français (natif)', 'Anglais', 'Espagnol'] },
      { label: 'Divers', items: ['Permis B'] },
    ],
  },
]
