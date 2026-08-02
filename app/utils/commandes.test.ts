import { describe, expect, it } from 'vitest'
import { profil, projets } from '~/content'
import { liensNavigation } from '~/sections/ordre'
import { construireCommandes, texteRecherchable } from './commandes'
import { filtrerParPertinence } from './recherche'

const commandes = construireCommandes(projets, profil)

/** Meilleur résultat pour une requête, tel que la palette l'exécuterait. */
function premier(requete: string) {
  return filtrerParPertinence(commandes, requete, texteRecherchable)[0]?.entree
}

describe('construireCommandes', () => {
  it('couvre toutes les sections de la navigation', () => {
    const ancres = commandes
      .map(c => c.action)
      .filter(a => a.type === 'ancre')
      .map(a => a.href)
    expect(ancres).toEqual(liensNavigation.map(l => l.href))
  })

  it('couvre tous les projets', () => {
    const fiches = commandes.filter(c => c.action.type === 'fiche')
    expect(fiches).toHaveLength(projets.length)
  })

  it('n\'expose une commande de démo que pour les projets qui en ont une', () => {
    const demos = commandes.filter(c => c.action.type === 'demo')
    expect(demos).toHaveLength(projets.filter(p => p.demo).length)
    expect(demos.length).toBeGreaterThan(0)
  })

  it('donne un identifiant unique à chaque commande', () => {
    // Un doublon casserait aria-activedescendant et les clés de rendu.
    const ids = commandes.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('donne un libellé non vide à chaque commande', () => {
    expect(commandes.every(c => c.libelle.trim().length > 0)).toBe(true)
  })

  it('reprend les coordonnées du profil sans les recopier', () => {
    const copie = commandes.find(c => c.id === 'copier-email')
    expect(copie?.action).toEqual({ type: 'copier', valeur: profil.email })
    expect(commandes.find(c => c.id === 'github')?.action).toEqual({ type: 'externe', url: profil.github })
  })
})

describe('recherche dans la palette', () => {
  it('trouve une section par son nom', () => {
    expect(premier('contact')?.action).toEqual({ type: 'ancre', href: '#contact' })
  })

  it('trouve un projet par une techno qui n\'est pas dans son titre', () => {
    // « Go » n'apparaît que dans les tags du projet FTP.
    const trouve = premier('golang'.slice(0, 2))
    expect(trouve?.groupe).toBe('Projets')
  })

  it('trouve la copie de l\'e-mail par « mail »', () => {
    expect(premier('mail')?.id).toBe('copier-email')
  })

  it('trouve la bascule de thème par « dark »', () => {
    expect(premier('dark')?.id).toBe('theme')
  })

  it('ne rend rien pour une requête sans rapport', () => {
    expect(premier('xqzw')).toBeUndefined()
  })

  it('classe les projets écrits en Go devant une action qui contient les lettres par hasard', () => {
    // « go » se retrouve dans « Imprimer la page » par simple sous-séquence.
    const ids = filtrerParPertinence(commandes, 'go', texteRecherchable).map(r => r.entree.id)
    expect(ids).toContain('imprimer')
    expect(ids.indexOf('projet-plateforme-microservices')).toBeLessThan(ids.indexOf('imprimer'))
  })

  it('ne renvoie que le CV pour « cv »', () => {
    // Deux lettres suffisent à toucher la moitié des titres sans garde-fou.
    const ids = filtrerParPertinence(commandes, 'cv', texteRecherchable).map(r => r.entree.id)
    expect(ids).toEqual(['cv'])
  })
})

describe('texteRecherchable', () => {
  it('concatène libellé, détail et synonymes', () => {
    const cv = commandes.find(c => c.id === 'cv')!
    const texte = texteRecherchable(cv)
    expect(texte).toContain('Ouvrir le CV')
    expect(texte).toContain('curriculum')
  })

  it('omet les champs absents sans laisser d\'espace en trop', () => {
    const theme = commandes.find(c => c.id === 'theme')!
    expect(theme.detail).toBeUndefined()
    expect(texteRecherchable(theme)).not.toMatch(/\s{2}/)
  })
})
