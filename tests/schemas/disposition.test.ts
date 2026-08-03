import { describe, expect, it } from 'vitest'
import { BANDES, BOITES, BUS, LIENS, NOTES, VUE } from '~/schemas/reseau/disposition'
import { hotesDuVlan } from '~/schemas/reseau/donnees'

/** Deux rectangles se recouvrent-ils ? Contact bord à bord accepté. */
function seRecouvrent(a: typeof BOITES[number], b: typeof BOITES[number]): boolean {
  return a.x < b.x + b.largeur
    && b.x < a.x + a.largeur
    && a.y < b.y + b.hauteur
    && b.y < a.y + a.hauteur
}

/** Toutes les ancres nommées par un lien, boîtes et bus compris. */
const ancres = new Set([...BOITES.map(b => b.id), 'bus'])

describe('disposition du schéma', () => {
  it('garde toutes les boîtes dans la vue', () => {
    for (const boite of BOITES) {
      expect(boite.x, boite.id).toBeGreaterThanOrEqual(0)
      expect(boite.y, boite.id).toBeGreaterThanOrEqual(0)
      expect(boite.x + boite.largeur, boite.id).toBeLessThanOrEqual(VUE.largeur)
      expect(boite.y + boite.hauteur, boite.id).toBeLessThanOrEqual(VUE.hauteur)
    }
  })

  it('n\'empile aucune boîte sur une autre', () => {
    // C'est le défaut qu'on ne voit pas dans un diff et qui saute aux yeux à
    // l'écran.
    for (let i = 0; i < BOITES.length; i++) {
      for (let j = i + 1; j < BOITES.length; j++) {
        const [a, b] = [BOITES[i]!, BOITES[j]!]
        expect(seRecouvrent(a, b), `${a.id} recouvre ${b.id}`).toBe(false)
      }
    }
  })

  it('laisse la place au texte dans chaque boîte', () => {
    // Le titre occupe une ligne, puis chaque détail 23 px sous lui.
    for (const boite of BOITES) {
      const requis = 56 + (boite.lignes.length - 1) * 23 + 14
      expect(boite.hauteur, boite.id).toBeGreaterThanOrEqual(requis)
    }
  })

  it('empile les bandes sans trou ni chevauchement', () => {
    let attendu = 0
    for (const bande of BANDES) {
      expect(bande.y, bande.id).toBe(attendu)
      attendu += bande.hauteur
    }
    // Les bandes doivent couvrir exactement la hauteur de la vue.
    expect(attendu).toBe(VUE.hauteur)
  })

  it('ne relie que des ancres existantes', () => {
    for (const lien of LIENS) {
      expect(ancres.has(lien.de), `origine inconnue : ${lien.de}`).toBe(true)
      expect(ancres.has(lien.vers), `cible inconnue : ${lien.vers}`).toBe(true)
    }
  })

  it('raccorde chaque machine du VLAN au bus', () => {
    const raccordees = LIENS.filter(l => l.de === 'bus').map(l => l.vers)
    expect(raccordees.sort()).toEqual(hotesDuVlan.map(h => h.nom).sort())

    for (const lien of LIENS.filter(l => l.de === 'bus')) {
      expect(lien.y1, lien.vers).toBe(BUS.y)
    }
  })

  it('tient les traits dans la vue', () => {
    for (const lien of LIENS) {
      for (const [axe, valeur, max] of [['x', lien.x1, VUE.largeur], ['x', lien.x2, VUE.largeur], ['y', lien.y1, VUE.hauteur], ['y', lien.y2, VUE.hauteur]] as const) {
        expect(valeur, `${lien.de}→${lien.vers} ${axe}`).toBeGreaterThanOrEqual(0)
        expect(valeur, `${lien.de}→${lien.vers} ${axe}`).toBeLessThanOrEqual(max)
      }
    }
  })

  it('couvre le bus par les machines qu\'il dessert', () => {
    // Un bus plus court que ses raccordements laisserait un trait dans le vide.
    const raccords = LIENS.filter(l => l.de === 'bus').map(l => l.x1)
    expect(Math.min(...raccords)).toBeGreaterThanOrEqual(BUS.x1)
    expect(Math.max(...raccords)).toBeLessThanOrEqual(BUS.x2)
  })

  it('distingue la délégation d\'un câble', () => {
    const delegation = LIENS.find(l => l.etiquette)
    expect(delegation?.logique).toBe(true)
    expect(delegation?.vers).toBe('dns-2')
  })

  it('pose chaque annotation dans la vue', () => {
    for (const note of NOTES) {
      expect(note.x, note.id).toBeGreaterThanOrEqual(0)
      expect(note.x, note.id).toBeLessThanOrEqual(VUE.largeur)
      expect(note.y, note.id).toBeGreaterThan(0)
      expect(note.y, note.id).toBeLessThanOrEqual(VUE.hauteur)
    }
  })
})
