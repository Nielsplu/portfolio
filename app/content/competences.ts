import type { GroupeCompetences } from '~/types/content'

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
