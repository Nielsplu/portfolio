import type { Projet } from '~/types/content'

// N'ajouter que des liens accessibles sans compte : un lien qui tombe sur une
// page de login GitLab ou un 404 GitHub dessert plus qu'il ne sert.
//
// `description` tient en une phrase : c'est ce que lit un visiteur qui survole
// la grille. Le détail va dans `details`, montré dans la fiche du projet — une
// carte saturée de spécificités n'est lue par personne.
export const projets: Projet[] = [
  {
    titre: 'Warhammer 40k Army Builder',
    sousTitre: 'Projet personnel',
    description:
      "Application web de création de listes d'armées, articulée autour d'un moteur de règles complet.",
    details: [
      'Validation en temps réel : règle de 3, quotas de détachement, personnages nommés.',
      'Résolution automatique des armes et des transports.',
      'Export imprimable des listes constituées.',
      'Architecture Nuxt 4 en layers, TypeScript strict.',
      'Tests Vitest, CI/CD GitHub Actions, détection de secrets avec Gitleaks.',
    ],
    tags: ['Nuxt 4', 'Vue 3', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Prisma', 'Vitest', 'GitHub Actions'],
    categorie: 'Web',
    // Repo actuellement privé sur GitHub : `codePrive` l'affiche sur la carte,
    // pour ne pas laisser croire à un lien oublié. Le passer en public (ou
    // déployer une démo), puis retirer ce drapeau et ajouter le lien.
    // liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/Warhammer' }],
    codePrive: true,
  },
  {
    titre: 'Solution de traitement documentaire intelligent',
    sousTitre: 'Stage AEROW — pôle IDP',
    description:
      "Plateforme de collecte et d'analyse documentaire, conçue et développée de bout en bout.",
    // Les chiffres viennent de la fiche de stage (voir content/parcours.ts) :
    // ce sont les seules mesures concrètes du portfolio, elles méritaient
    // mieux qu'une ligne de timeline.
    details: [
      'Architecture microservices en Clean Architecture, avec BFF.',
      'API métier : environ 60 routes.',
      'Interfaces utilisateur en Next.js.',
      'Intégration IA : OCR et agents.',
      'Sécurisation par JWT.',
      '163 tests unitaires, écrits en TDD.',
      '11 conteneurs Docker.',
    ],
    tags: ['.NET 10', 'ASP.NET Core', 'PostgreSQL', 'Dapper', 'Next.js 15', 'React', 'Docker', 'Traefik'],
    categorie: 'Backend & DevOps',
  },
  {
    titre: 'Site web marchand',
    sousTitre: 'Projet universitaire',
    description:
      'Site e-commerce développé en PHP avec CodeIgniter 4, du modèle de données au déploiement.',
    details: [
      'Architecture MVC sous CodeIgniter 4.',
      'Base de données pilotée par migrations, et jeu de données de test via un seeder dédié.',
      'Interface responsive.',
      'Déploiement conteneurisé avec podman-compose, réglable par variables d’environnement.',
      'Documentation technique générée avec Sphinx, thème Read the Docs et domaine PHP.',
    ],
    tags: ['PHP', 'CodeIgniter 4', 'MVC', 'Podman', 'Sphinx'],
    categorie: 'Web',
    liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/site-marchand-codeigniter' }],
  },
  {
    titre: 'Plateforme microservices',
    sousTitre: 'Projet universitaire',
    description:
      'Monorepo de quatre microservices Node.js, chacun responsable d’un maillon de la chaîne.',
    // Dépôt hébergé sur le GitLab de l'université, donc sans README public à
    // consulter : ces points redécoupent la description d'origine.
    details: [
      'Quatre services : authentification, passerelle API faisant proxy, collecte automatique de flux RSS, et stockage.',
      'Persistance en MongoDB.',
      'Pipeline CI/CD GitLab.',
      'Tests unitaires et tests d’intégration.',
      'API documentée avec Swagger.',
    ],
    tags: ['Node.js', 'MongoDB', 'Docker', 'CI/CD GitLab', 'Swagger', 'Turbo'],
    categorie: 'Backend & DevOps',
  },
  {
    titre: 'Infrastructure réseau sécurisée',
    sousTitre: 'Projet universitaire — équipe de 5',
    description:
      "Conception et déploiement d'un réseau complet, de la segmentation jusqu'au pare-feu.",
    details: [
      'Segmentation en VLAN (id 18) sur le réseau 10.0.18.0/24.',
      'Cinq machines : routeur, serveur web, DNS secondaire, serveur DHCP et poste interne.',
      'Attribution dynamique des adresses via isc-dhcp-server.',
      'DNS Bind9 avec délégation, le domaine restant volontairement confiné au réseau privé.',
      'Serveur web Apache et synchronisation horaire NTP.',
      'Pare-feu iptables en politique de moindre privilège, avec NAT vers l’extérieur.',
    ],
    tags: ['VLAN', 'DHCP', 'Bind9', 'Apache', 'iptables', 'NAT'],
    categorie: 'Réseaux & Sécurité',
    liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/sae-reseaux' }],
  },
  {
    titre: 'Serveur et client FTP en Go',
    // Les README des dépôts listent les auteurs : le préciser vaut mieux que de
    // laisser un recruteur supposer un travail solo puis découvrir l'inverse.
    sousTitre: 'Projet universitaire — équipe de 3',
    description:
      "Implémentation complète d'un protocole de transfert de fichiers en Go, client et serveur.",
    // Détails tirés du README du dépôt, pas d'une reformulation : ce sont les
    // faits que le code lui-même documente.
    details: [
      'Sept commandes implémentées : List, Cd, Get, End, Hide, Reveal, Terminate.',
      "Deux implémentations de Get : envoi direct pour les petits fichiers, découpage en chunks pour les gros.",
      "Timeout d'une minute sur les connexions inactives.",
      "Arborescence servie cloisonnée : impossible de remonter hors du répertoire de données.",
      "Concurrence gérée par un design pattern « Stopper » écrit par l'équipe. Un stopper commande une liste d'enfants, leur demande de s'arrêter proprement et attend leur fin — utilisé pour les boucles d'acceptation, un enfant par port ouvert, et pour chaque connexion, découpée en un lecteur maître et un écrivain qu'il pilote.",
      "La démo de cette page compile le vrai serveur et le vrai client en WebAssembly, reliés par le réseau loopback en mémoire de Go : seule la vue terminale est remplacée par la page.",
    ],
    tags: ['Go', 'Concurrence', 'Réseau', 'CLI'],
    categorie: 'Réseaux & Sécurité',
    demo: 'ftp',
    demoAccroche:
      "Le serveur FTP écrit en Go est compilé en WebAssembly : le binaire s'exécute dans votre navigateur, sans rien installer ni contacter de serveur.",
    liens: [
      { label: 'Code', url: 'https://github.com/Nielsplu/ftp-go' },
      { label: 'Binaires', url: 'https://github.com/Nielsplu/ftp-go/releases/tag/v1.0' },
    ],
  },
]
