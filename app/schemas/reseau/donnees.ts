// Données du schéma réseau, relevées dans les fichiers de configuration du
// dépôt github.com/Nielsplu/sae-reseaux — et non ressaisies de mémoire.
//
// Les fichiers sont paramétrés (`{{X}}`, `{{domaine}}`, `{{mac_addr}}`) et
// instanciés par `start.sh`. Les valeurs ci-dessous sont celles du rapport,
// avec X = 18 ; aucun domaine réel ni adresse MAC n'y figure.

/** Une machine du montage. `x` est sa position sur le bus VLAN du schéma. */
export interface Hote {
  nom: string
  ip: string
  role: string
  /** Rattachée au VLAN 18, donc dessinée sur le bus. */
  surLeVlan: boolean
  x?: number
}

/** Source : les commandes `ip a add` du rapport et `dhcpd.conf`. */
export const adressage: Hote[] = [
  { nom: 'externe', ip: '192.168.0.1/24', role: 'hors VLAN, côté eth0', surLeVlan: false },
  { nom: 'routeur', ip: '10.0.18.1/24', role: 'passerelle · pare-feu · DNS maître', surLeVlan: false },
  { nom: 'serveur', ip: '10.0.18.2/24', role: 'cible du CNAME www', surLeVlan: true, x: 125 },
  { nom: 'dns-2', ip: '10.0.18.3/24', role: 'zone déléguée', surLeVlan: true, x: 300 },
  { nom: 'dhcp', ip: '10.0.18.4/24', role: 'isc-dhcp-server', surLeVlan: true, x: 475 },
  { nom: 'interne', ip: '10.0.18.18/24', role: 'Apache + PHP', surLeVlan: true, x: 640 },
]

/**
 * Hôtes dessinés sur le bus du schéma. Le prédicat restreint le type : sans
 * lui, `x` reste optionnel et le gabarit ne peut pas s'en servir.
 */
export const hotesDuVlan = adressage.filter(
  (hote): hote is Hote & { x: number } => hote.surLeVlan && hote.x !== undefined,
)

/** Marqueurs de paramétrage des fichiers de configuration, cités tels quels. */
export const MARQUEURS = ['{{X}}', '{{domaine}}'] as const

/** Source : `assets/dhcp/dhcpd.conf`. */
export const dhcp: Array<{ cle: string, valeur: string }> = [
  { cle: 'sous-réseau', valeur: '10.0.18.0/24' },
  { cle: 'plage', valeur: '10.0.18.100 → 10.0.18.200' },
  { cle: 'passerelle', valeur: '10.0.18.1' },
  { cle: 'DNS annoncé', valeur: '10.0.18.1' },
  { cle: 'réservation', valeur: 'interne → 10.0.18.18, sur son adresse MAC' },
  { cle: 'bail', valeur: '600 s par défaut, 7 200 s au maximum' },
  { cle: 'mise à jour DNS', valeur: 'désactivée (ddns-update-style none)' },
]

/** Source : `named.conf.local` et les fichiers de zone, côté routeur et dns-2. */
export const dns = [
  {
    nom: '<domaine>.com',
    serveur: 'maître sur routeur',
    enregistrements: [
      '@           IN NS    routeur',
      'routeur     IN A     192.168.18.1',
      'serveur     IN A     10.0.18.2',
      'dns-2       IN A     10.0.18.3',
      'delegation  IN NS    dns-2   ← délégation',
      'www         IN CNAME serveur',
    ],
  },
  {
    nom: 'delegation.<domaine>.com',
    serveur: 'maître sur dns-2',
    enregistrements: [
      '@           IN NS    dns-2.delegation',
      'dns-2       IN A     10.0.18.3',
      'routeur     IN A     10.0.18.1',
      'serveur     IN A     10.0.18.2',
      'www         IN CNAME serveur',
    ],
  },
]

/** Source : le bloc iptables de `start.sh`. */
export const pareFeu = {
  politique: ['INPUT DROP', 'FORWARD DROP', 'OUTPUT ACCEPT'],
  exceptions: [
    { quoi: '-i lo', pourquoi: 'boucle locale' },
    { quoi: '--state ESTABLISHED,RELATED', pourquoi: 'trafic retour des connexions déjà autorisées' },
    { quoi: '-p icmp', pourquoi: 'diagnostic réseau (ping, traceroute)' },
    { quoi: '-i eth1.18 --dport 53', pourquoi: 'résolution de noms, depuis le VLAN seulement' },
    { quoi: '-i eth1.18 --dport 67', pourquoi: 'attribution des baux, depuis le VLAN seulement' },
    { quoi: '--dport 123', pourquoi: 'synchronisation d\'horloge (NTP)' },
    { quoi: 'POSTROUTING -o eth0 MASQUERADE', pourquoi: 'sortie du VLAN vers l\'extérieur' },
    { quoi: 'PREROUTING --dport 8080 DNAT', pourquoi: 'publie le site interne sur le port 8080 externe' },
    { quoi: 'FORWARD eth0 → eth1.18 --dport 80', pourquoi: 'laisse passer le trafic ainsi redirigé' },
  ],
}
