import { describe, expect, it } from 'vitest'
import { SEUIL_GROS_FICHIER, creerEtat, executerCommande, formatTaille, invite } from './simulation'

describe('demoFtp', () => {
  it('liste la racine avec dossiers et tailles', () => {
    const etat = creerEtat()
    const { lignes } = executerCommande(etat, 'List')
    expect(lignes.some(l => l.startsWith('important/'))).toBe(true)
    expect(lignes.some(l => l.includes('zab.txt'))).toBe(true)
  })

  it('navigue avec Cd, Cd .. et Cd sans argument', () => {
    const etat = creerEtat()
    executerCommande(etat, 'Cd important')
    expect(invite(etat)).toBe('data/important/')
    executerCommande(etat, 'Cd test')
    expect(invite(etat)).toBe('data/important/test/')
    executerCommande(etat, 'Cd ..')
    expect(invite(etat)).toBe('data/important/')
    executerCommande(etat, 'Cd')
    expect(invite(etat)).toBe('data/')
  })

  it('refuse un Cd vers un dossier inexistant ou un fichier', () => {
    const etat = creerEtat()
    expect(executerCommande(etat, 'Cd zab.txt').lignes[0]).toContain('introuvable')
    expect(invite(etat)).toBe('data/')
  })

  it('Get renvoie un téléchargement, gros fichier au-delà du seuil', () => {
    const etat = creerEtat()
    const petit = executerCommande(etat, 'Get zab.txt').telechargement
    expect(petit?.contenu).toBe('Salut man')
    expect(petit && petit.taille < SEUIL_GROS_FICHIER).toBe(true)
    const gros = executerCommande(etat, 'Get zib.txt').telechargement
    expect(gros && gros.taille > SEUIL_GROS_FICHIER).toBe(true)
  })

  it('Hide masque un fichier pour List et Get, Reveal le restaure', () => {
    const etat = creerEtat()
    executerCommande(etat, 'Hide zab.txt')
    expect(executerCommande(etat, 'List').lignes.join()).not.toContain('zab.txt')
    expect(executerCommande(etat, 'Get zab.txt').lignes[0]).toContain('introuvable')
    executerCommande(etat, 'Reveal zab.txt')
    expect(executerCommande(etat, 'List').lignes.join()).toContain('zab.txt')
  })

  it('End et Terminate ferment la session', () => {
    const etat = creerEtat()
    expect(executerCommande(etat, 'End').deconnexion).toBe('end')
    expect(executerCommande(etat, 'Terminate').deconnexion).toBe('terminate')
  })

  it('commande inconnue et casse insensible', () => {
    const etat = creerEtat()
    expect(executerCommande(etat, 'foobar').lignes[0]).toContain('Commande inconnue')
    expect(executerCommande(etat, 'lIsT').lignes.length).toBeGreaterThan(0)
  })

  it('formate les tailles en français', () => {
    expect(formatTaille(9)).toBe('9 o')
    expect(formatTaille(62145)).toBe('60,7 Ko')
    expect(formatTaille(38774568)).toBe('37,0 Mo')
  })
})
