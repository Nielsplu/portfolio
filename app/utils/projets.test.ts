import { describe, expect, it } from 'vitest'
import { filtrerParCategorie } from './projets'

const items = [
  { nom: 'a', categorie: 'Web' },
  { nom: 'b', categorie: 'Backend' },
  { nom: 'c', categorie: 'Web' },
]

describe('filtrerParCategorie', () => {
  it('retourne tout quand le filtre est "Tous"', () => {
    expect(filtrerParCategorie(items, 'Tous')).toHaveLength(3)
  })

  it('ne garde que les éléments de la catégorie demandée', () => {
    const resultat = filtrerParCategorie(items, 'Web')
    expect(resultat).toHaveLength(2)
    expect(resultat.every(i => i.categorie === 'Web')).toBe(true)
  })

  it('retourne un tableau vide si aucune catégorie ne correspond', () => {
    expect(filtrerParCategorie(items, 'Inconnue')).toHaveLength(0)
  })
})
