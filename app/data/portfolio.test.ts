import { describe, expect, it } from 'vitest'
import { demos } from '../demos'
import { categoriesProjet, competences, parcours, profil, projets } from './portfolio'

describe('profil', () => {
  it('a un email valide', () => {
    expect(profil.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
})

describe('projets', () => {
  it('a des titres uniques (utilisés comme clé de rendu)', () => {
    const titres = projets.map(p => p.titre)
    expect(new Set(titres).size).toBe(titres.length)
  })

  it('appartient tous à une catégorie déclarée dans categoriesProjet', () => {
    for (const p of projets) {
      expect(categoriesProjet).toContain(p.categorie)
    }
  })

  it('a au moins un tag chacun', () => {
    for (const p of projets) {
      expect(p.tags.length).toBeGreaterThan(0)
    }
  })

  it('a des liens valides (label non vide, URL en https)', () => {
    for (const p of projets) {
      for (const l of p.liens ?? []) {
        expect(l.label.trim().length).toBeGreaterThan(0)
        expect(l.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('ne référence que des démos présentes dans le registre app/demos', () => {
    for (const p of projets) {
      if (p.demo) expect(Object.keys(demos)).toContain(p.demo)
    }
  })
})

describe('parcours', () => {
  it('a des titres uniques (utilisés comme clé de rendu)', () => {
    const titres = parcours.map(e => e.titre)
    expect(new Set(titres).size).toBe(titres.length)
  })
})

describe('competences', () => {
  it("n'a pas de sous-groupe vide", () => {
    for (const c of competences) {
      for (const g of c.groupes) {
        expect(g.items.length).toBeGreaterThan(0)
      }
    }
  })
})
