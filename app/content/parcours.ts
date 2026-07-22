import type { EtapeParcours } from '~/types/content'

export const parcours: EtapeParcours[] = [
  {
    periode: '2024 – 2027',
    titre: 'BUT Informatique',
    lieu: 'IUT de Nantes',
    description:
      'Développement web et logiciel, bases de données, systèmes et réseaux. Projets en équipe menés en conditions réelles (Git, CI/CD, conteneurs).',
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
