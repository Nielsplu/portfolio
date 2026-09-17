import { describe, expect, it } from 'vitest'
import { commandeFichier, filAriane, remonteesVers } from '~/demos/ftp/explorateur'

describe('filAriane', () => {
  it('renvoie la racine seule quand le chemin est vide', () => {
    expect(filAriane('')).toEqual(['data'])
  })

  it('décompose un chemin en segments préfixés par data', () => {
    expect(filAriane('/important')).toEqual(['data', 'important'])
    expect(filAriane('/important/test')).toEqual(['data', 'important', 'test'])
  })

  it('ignore les séparateurs superflus', () => {
    expect(filAriane('//important//test/')).toEqual(['data', 'important', 'test'])
  })
})

describe('remonteesVers', () => {
  const fil = ['data', 'important', 'test']

  it('ne remonte de rien pour le dossier courant (dernier segment)', () => {
    expect(remonteesVers(fil, 2)).toBe(0)
  })

  it('remonte du bon nombre de niveaux vers un ancêtre', () => {
    expect(remonteesVers(fil, 1)).toBe(1)
    expect(remonteesVers(fil, 0)).toBe(2)
  })

  it('reste positif si l\'index dépasse le fil', () => {
    expect(remonteesVers(fil, 9)).toBe(0)
  })
})

describe('commandeFichier', () => {
  it('télécharge en mode client', () => {
    expect(commandeFichier('zab.txt', false)).toBe('Get zab.txt')
  })

  it('masque en mode admin', () => {
    expect(commandeFichier('zab.txt', true)).toBe('Hide zab.txt')
  })
})
