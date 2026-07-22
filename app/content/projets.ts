import type { Projet } from '~/types/content'

// N'ajouter que des liens accessibles sans compte : un lien qui tombe sur une
// page de login GitLab ou un 404 GitHub dessert plus qu'il ne sert.
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
