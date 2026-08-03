// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchemaReseau from '~/schemas/reseau/SchemaReseau.vue'
import { MARQUEURS, adressage, dhcp, dns, hotesDuVlan, pareFeu } from '~/schemas/reseau/donnees'
import { BANDES, BOITES, LIENS } from '~/schemas/reseau/disposition'
import { projets } from '~/content'
import { schemas } from '~/schemas'

const VLAN = '10.0.18.'

/** Partie numérique d'une adresse du VLAN, ou null si elle n'en est pas. */
function dernierOctet(ip: string): number | null {
  if (!ip.startsWith(VLAN)) return null
  return Number.parseInt(ip.slice(VLAN.length), 10)
}

describe('données relevées dans les configs', () => {
  it('place toutes les machines du VLAN dans le même sous-réseau', () => {
    for (const hote of hotesDuVlan) {
      expect(hote.ip, hote.nom).toMatch(/^10\.0\.18\.\d+\/24$/)
    }
  })

  it('ne dessine sur le bus que des hôtes positionnés', () => {
    expect(hotesDuVlan.every(h => Number.isFinite(h.x))).toBe(true)
    expect(hotesDuVlan).toHaveLength(adressage.filter(h => h.surLeVlan).length)
  })

  it('espace les hôtes sans les superposer', () => {
    // Deux boîtes de 136 px au même endroit se recouvriraient.
    const positions = hotesDuVlan.map(h => h.x)
    expect(new Set(positions).size).toBe(positions.length)
    const tries = [...positions].sort((a, b) => a - b)
    for (let i = 1; i < tries.length; i++) {
      expect(tries[i]! - tries[i - 1]!).toBeGreaterThanOrEqual(136)
    }
  })

  it('garde la plage DHCP hors des adresses fixes', () => {
    // Une plage qui recouvrirait une adresse statique provoquerait un conflit.
    const plage = dhcp.find(l => l.cle === 'plage')!.valeur
    const [debut, fin] = plage.match(/10\.0\.18\.\d+/g)!.map(dernierOctet) as [number, number]
    expect(debut).toBeLessThan(fin)

    for (const hote of adressage) {
      const octet = dernierOctet(hote.ip)
      if (octet === null) continue
      expect(octet < debut || octet > fin, `${hote.nom} (${hote.ip}) tombe dans la plage`).toBe(true)
    }
  })

  it('déclare la délégation dans la zone parente et la sert depuis la fille', () => {
    // C'est le point technique du montage : sans l'enregistrement NS côté
    // parent, la zone fille n'est jamais interrogée.
    const [parente, fille] = dns
    expect(parente!.enregistrements.some(e => /delegation\s+IN NS\s+dns-2/.test(e))).toBe(true)
    expect(fille!.nom.startsWith('delegation.')).toBe(true)
    expect(fille!.serveur).toContain('dns-2')
  })

  it('refuse tout trafic par défaut', () => {
    expect(pareFeu.politique).toContain('INPUT DROP')
    expect(pareFeu.politique).toContain('FORWARD DROP')
  })

  it('justifie chaque exception du pare-feu', () => {
    // Une exception sans raison écrite est une exception qu'on ne saura pas
    // relire dans six mois.
    for (const regle of pareFeu.exceptions) {
      expect(regle.pourquoi.trim().length, regle.quoi).toBeGreaterThan(10)
    }
  })

  it('ne divulgue ni domaine réel ni adresse MAC', () => {
    // Les fichiers du dépôt sont paramétrés ; ce garde-fou évite qu'on colle
    // un jour de vraies valeurs en croyant « compléter » le schéma.
    const tout = JSON.stringify({ adressage, dhcp, dns, pareFeu })
    expect(tout).not.toMatch(/([0-9a-f]{2}:){5}[0-9a-f]{2}/i)
    expect(tout).not.toMatch(/\b[a-z0-9-]+\.(com|fr|net|org)\b/i)
    expect(MARQUEURS.every(m => m.startsWith('{{'))).toBe(true)
  })
})

describe('rendu du schéma', () => {
  it('dessine une boîte par élément de la disposition', () => {
    const rendu = mount(SchemaReseau)
    // Les rectangles du dessin : une bande par niveau, une boîte par élément.
    expect(rendu.findAll('.schema__svg rect.boite')).toHaveLength(BOITES.length)
    expect(rendu.findAll('.schema__svg rect.bande')).toHaveLength(BANDES.length)
  })

  it('nomme et adresse chaque machine du VLAN', () => {
    const dessin = mount(SchemaReseau).get('.schema__svg').text()
    for (const hote of hotesDuVlan) {
      expect(dessin, hote.nom).toContain(hote.nom)
      expect(dessin, hote.ip).toContain(hote.ip)
    }
  })

  it('raccorde chaque machine par un trait', () => {
    const rendu = mount(SchemaReseau)
    // Un trait par lien, plus la ligne du bus.
    expect(rendu.findAll('.schema__svg line')).toHaveLength(LIENS.length + 1)
    expect(rendu.findAll('.schema__svg line.lien--logique')).toHaveLength(1)
  })

  it('donne un nom accessible au dessin', () => {
    // Sans titre lié, un lecteur d'écran annonce « image » et rien d'autre.
    const svg = mount(SchemaReseau).get('.schema__svg')
    const cible = svg.attributes('aria-labelledby')!.split(' ')

    expect(svg.attributes('role')).toBe('img')
    expect(svg.get('title').attributes('id')).toBe(cible[0])
    expect(svg.get('desc').attributes('id')).toBe(cible[1])
  })

  it('reprend tout le plan d\'adressage dans le tableau', () => {
    // Le dessin omet volontairement les rôles ; le tableau doit les porter.
    const rendu = mount(SchemaReseau)
    expect(rendu.findAll('.schema__table tbody tr')).toHaveLength(adressage.length)
    for (const hote of adressage) {
      expect(rendu.get('.schema__table').text()).toContain(hote.role)
    }
  })

  it('cite ses sources', () => {
    const legende = mount(SchemaReseau).get('.schema__legende').text()
    expect(legende).toContain('dhcpd.conf')
    expect(legende).toContain('start.sh')
  })
})

describe('branchement au contenu', () => {
  it('rattache le schéma au projet réseau, et à lui seul', () => {
    const avecSchema = projets.filter(p => p.schema)
    expect(avecSchema).toHaveLength(1)
    expect(avecSchema[0]!.categorie).toBe('Réseaux & Sécurité')
  })

  it('ne référence que des schémas présents au registre', () => {
    for (const projet of projets) {
      if (projet.schema) expect(Object.keys(schemas)).toContain(projet.schema)
    }
  })
})
