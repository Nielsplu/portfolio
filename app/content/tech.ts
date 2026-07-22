import type { SimpleIcon } from 'simple-icons'
import {
  siApache,
  siCodeigniter,
  siCss,
  siDocker,
  siDotnet,
  siEslint,
  siGithubactions,
  siGitlab,
  siGo,
  siHtml5,
  siJavascript,
  siMake,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siNuxt,
  siPhp,
  siPodman,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSphinx,
  siSwagger,
  siTailwindcss,
  siTraefikproxy,
  siTurborepo,
  siTypescript,
  siVitest,
  siVuedotjs,
} from 'simple-icons'

// Registre nom de techno → logo (Simple Icons, embarqués dans le bundle, aucun
// appel réseau). Point d'extension unique, partagé par les cartes projet et la
// section compétences : une techno absente d'ici s'affiche simplement avec son
// nom (voir TechBadge). Ajouter un logo = une ligne.
export const techIcons: Record<string, SimpleIcon> = {
  // Langages
  'Go': siGo,
  'PHP': siPhp,
  'Python': siPython,
  'TypeScript': siTypescript,
  'JavaScript': siJavascript,
  'HTML': siHtml5,
  'CSS': siCss,

  // Frameworks & web
  'Nuxt 4': siNuxt,
  'Vue 3': siVuedotjs,
  'Nuxt / Vue 3': siNuxt,
  'Next.js 15': siNextdotjs,
  'React': siReact,
  'Next.js / React': siReact,
  '.NET 10': siDotnet,
  'ASP.NET Core': siDotnet,
  '.NET / ASP.NET Core': siDotnet,
  'Node.js': siNodedotjs,
  'CodeIgniter 4': siCodeigniter,
  'Tailwind': siTailwindcss,

  // Données
  'PostgreSQL': siPostgresql,
  'MongoDB': siMongodb,
  'Prisma': siPrisma,

  // Outils & DevOps
  'Docker': siDocker,
  'Podman': siPodman,
  'Traefik': siTraefikproxy,
  'GitHub Actions': siGithubactions,
  'CI/CD GitLab': siGitlab,
  'Vitest': siVitest,
  'ESLint': siEslint,
  'Swagger': siSwagger,
  'Turbo': siTurborepo,
  'Apache': siApache,
  'Sphinx': siSphinx,
  'Make.com': siMake,
}
