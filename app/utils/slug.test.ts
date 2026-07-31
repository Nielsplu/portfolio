import { describe, expect, it } from 'vitest'
import { projets } from '~/content'
import { versSlug } from './slug'

describe('versSlug', () => {
  it('met en minuscules et remplace les espaces par des tirets', () => {
    expect(versSlug('Serveur et client FTP en Go')).toBe('serveur-et-client-ftp-en-go')
  })

  it('retire les accents', () => {
    expect(versSlug('Infrastructure réseau sécurisée')).toBe('infrastructure-reseau-securisee')
  })

  it('réduit toute suite de séparateurs à un seul tiret', () => {
    expect(versSlug('Warhammer 40k  —  Army Builder')).toBe('warhammer-40k-army-builder')
  })

  it('ne laisse ni tiret initial ni tiret final', () => {
    expect(versSlug('  ! Site web marchand ?  ')).toBe('site-web-marchand')
  })

  it('conserve les chiffres', () => {
    expect(versSlug('CodeIgniter 4')).toBe('codeigniter-4')
  })
})

describe('slugs des projets', () => {
  const slugs = projets.map(p => versSlug(p.titre))

  it('produit un slug non vide pour chaque projet', () => {
    // Un slug vide rendrait la fiche impossible à atteindre par son URL.
    expect(slugs.every(s => s.length > 0)).toBe(true)
  })

  it('produit des slugs tous distincts', () => {
    // Deux projets au même slug : le lien partagé ouvrirait toujours le premier.
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('ne produit que des caractères sûrs dans une URL', () => {
    expect(slugs.every(s => /^[a-z0-9-]+$/.test(s))).toBe(true)
  })
})
