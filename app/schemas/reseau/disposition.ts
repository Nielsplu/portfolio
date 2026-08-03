// Géométrie du schéma réseau, sortie du gabarit pour être vérifiable.
//
// Un dessin se relit mal dans un diff et ne se teste pas à l'œil. En décrivant
// la disposition ici, on peut affirmer par des tests ce qu'on constaterait
// autrement à la main : rien ne déborde, rien ne se recouvre, chaque trait
// relie deux ancres réelles.
//
// Tout est dérivé de quelques constantes : déplacer une bande ou élargir une
// boîte recalcule le reste au lieu de désaligner le dessin.

import { hotesDuVlan } from './donnees'

export const VUE = { largeur: 880, hauteur: 592 }

const MARGE = 60
const ECART_HOTES = 20

/** Bandes horizontales : elles donnent la lecture de haut en bas. */
export const BANDES = [
  { id: 'exterieur', titre: 'EXTÉRIEUR', y: 0, hauteur: 140 },
  { id: 'passerelle', titre: 'PASSERELLE', y: 140, hauteur: 200 },
  { id: 'vlan', titre: 'VLAN 18 · 802.1Q · 10.0.18.0/24', y: 340, hauteur: 252 },
] as const

export interface Boite {
  id: string
  x: number
  y: number
  largeur: number
  hauteur: number
  titre: string
  /** Lignes secondaires, dans l'ordre d'affichage. */
  lignes: string[]
  /** Met la boîte en avant : c'est la pièce centrale du montage. */
  accent?: boolean
  /** Étiquette de rôle, en haut à droite. */
  badge?: string
}

const LARGEUR_HOTE = 170
const HAUTEUR_HOTE = 84
const Y_HOTES = 442

/** Rôle affiché en badge, par machine. */
const BADGES: Record<string, string> = {
  'serveur': 'SRV',
  'dns-2': 'DNS',
  'dhcp': 'DHCP',
  'interne': 'WEB',
}

const hotes: Boite[] = hotesDuVlan.map((hote, i) => ({
  id: hote.nom,
  x: MARGE + i * (LARGEUR_HOTE + ECART_HOTES),
  y: Y_HOTES,
  largeur: LARGEUR_HOTE,
  hauteur: HAUTEUR_HOTE,
  titre: hote.nom,
  lignes: [hote.ip],
  badge: BADGES[hote.nom],
}))

export const ROUTEUR: Boite = {
  id: 'routeur',
  x: 250,
  y: 176,
  largeur: 280,
  hauteur: 142,
  titre: 'routeur',
  lignes: ['eth0 · côté externe', 'eth1.18 · 10.0.18.1/24', 'ip_forward = 1 · DNS maître'],
  accent: true,
}

export const EXTERNE: Boite = {
  id: 'externe',
  x: 300,
  y: 40,
  largeur: 180,
  hauteur: 70,
  titre: 'externe',
  lignes: ['192.168.0.1/24'],
}

/** Le pare-feu est un panneau et non une boîte réseau : il n'a pas d'adresse. */
export const PARE_FEU: Boite = {
  id: 'pare-feu',
  x: 570,
  y: 176,
  largeur: 250,
  hauteur: 142,
  titre: 'iptables',
  lignes: [
    'INPUT · FORWARD : DROP',
    '53 · 67 depuis le VLAN',
    'ICMP · 123 (NTP)',
    '8080 → 10.0.18.18:80',
  ],
}

export const BOITES: Boite[] = [EXTERNE, ROUTEUR, PARE_FEU, ...hotes]

/** Ligne du bus VLAN : toutes les machines s'y raccordent. */
export const BUS = {
  y: 396,
  x1: MARGE,
  x2: MARGE + hotes.length * LARGEUR_HOTE + (hotes.length - 1) * ECART_HOTES,
}

export interface Lien {
  de: string
  vers: string
  x1: number
  y1: number
  x2: number
  y2: number
  /** Trait discontinu : relation logique et non câble physique. */
  logique?: boolean
  etiquette?: string
}

const centre = (b: Boite) => b.x + b.largeur / 2
const bas = (b: Boite) => b.y + b.hauteur

/** Liens dessinés, dans l'ordre de rendu. */
export const LIENS: Lien[] = [
  { de: 'externe', vers: 'routeur', x1: centre(EXTERNE), y1: bas(EXTERNE), x2: centre(ROUTEUR), y2: ROUTEUR.y },
  { de: 'routeur', vers: 'bus', x1: centre(ROUTEUR), y1: bas(ROUTEUR), x2: centre(ROUTEUR), y2: BUS.y },
  ...hotes.map(hote => ({ de: 'bus', vers: hote.id, x1: centre(hote), y1: BUS.y, x2: centre(hote), y2: hote.y })),
  // La délégation ne suit aucun câble : c'est un renvoi d'une zone à l'autre.
  {
    de: 'routeur',
    vers: 'dns-2',
    x1: ROUTEUR.x + 40,
    y1: bas(ROUTEUR),
    x2: centre(hotes.find(h => h.id === 'dns-2')!),
    y2: Y_HOTES,
    logique: true,
    etiquette: 'délégation NS',
  },
]

/** Annotations libres, positionnées à côté de ce qu'elles commentent. */
export const NOTES = [
  { id: 'entrant', x: centre(EXTERNE) + 14, y: bas(EXTERNE) + 26, texte: '↓ :8080 — DNAT', accent: true },
  { id: 'sortant', x: centre(EXTERNE) + 14, y: bas(EXTERNE) + 52, texte: '↑ MASQUERADE' },
  {
    id: 'bail',
    x: centre(hotes.find(h => h.id === 'dhcp')!),
    y: Y_HOTES + HAUTEUR_HOTE + 24,
    texte: 'baux 10.0.18.100 → .200',
    centre: true,
  },
]
