// @vitest-environment nuxt
import type { Projet } from '~/types/content'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProjetActions from '~/components/sections/ProjetActions.vue'

const BASE: Projet = {
  titre: 'Serveur et client FTP en Go',
  sousTitre: 'Projet universitaire',
  description: 'Serveur et client FTP écrits en Go.',
  tags: ['Go', 'Concurrence'],
  categorie: 'Backend & DevOps',
}

function monter(projet: Partial<Projet> = {}, variante: 'carte' | 'fiche' = 'carte') {
  return mount(ProjetActions, { props: { projet: { ...BASE, ...projet }, variante } })
}

/** Libellés des actions rendues, dans l'ordre. */
const libelles = (rendu: ReturnType<typeof monter>) =>
  rendu.findAll('.actions__item').map(e => e.text().replace(/\s+/g, ' ').trim())

afterEach(() => { vi.unstubAllGlobals() })

describe('actions communes aux deux variantes', () => {
  it('n\'affiche rien quand le projet n\'offre aucune action', () => {
    expect(monter().find('.actions').exists()).toBe(false)
  })

  it('propose la démo dans la carte comme dans la fiche', () => {
    // C'est le défaut d'origine : ouvrir le détail faisait perdre la démo.
    for (const variante of ['carte', 'fiche'] as const) {
      const rendu = monter({ demo: 'ftp' }, variante)
      expect(rendu.find('.actions__item--demo').exists(), variante).toBe(true)
    }
  })

  it('émet l\'ouverture de la démo', async () => {
    const rendu = monter({ demo: 'ftp' })
    await rendu.get('.actions__item--demo').trigger('click')
    expect(rendu.emitted('ouvrir-demo')).toHaveLength(1)
  })

  it('ouvre les liens externes dans un nouvel onglet, sans fuite d\'opener', () => {
    const rendu = monter({ liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/ftp-go' }] })
    const lien = rendu.get('a.actions__item')

    expect(lien.attributes('target')).toBe('_blank')
    expect(lien.attributes('rel')).toContain('noopener')
    expect(lien.text()).toContain('nouvel onglet')
  })

  it('signale un dépôt privé plutôt que de n\'afficher aucune action', () => {
    expect(monter({ codePrive: true }).get('.actions__item--prive').text()).toBe('Code privé')
  })
})

describe('variante carte', () => {
  it('n\'offre « En savoir plus » que s\'il y a de la matière à montrer', () => {
    expect(monter().find('.actions__item--detail').exists()).toBe(false)
    expect(monter({ details: ['Un point'] }).find('.actions__item--detail').exists()).toBe(true)
    expect(monter({ images: [{ src: '/a.png', alt: 'Capture' }] }).find('.actions__item--detail').exists()).toBe(true)
    // Un schéma technique est de la matière au même titre qu'une capture.
    expect(monter({ schema: 'reseau' }).find('.actions__item--detail').exists()).toBe(true)
  })

  it('suffixe le bouton du titre pour les lecteurs d\'écran', () => {
    // Sans cela, six cartes porteraient six boutons au même nom.
    const rendu = monter({ details: ['Un point'] })
    expect(rendu.get('.actions__item--detail .sr-only').text()).toContain(BASE.titre)
  })

  it('émet l\'ouverture de la fiche', async () => {
    const rendu = monter({ details: ['Un point'] })
    await rendu.get('.actions__item--detail').trigger('click')
    expect(rendu.emitted('ouvrir-detail')).toHaveLength(1)
  })

  it('n\'offre pas la copie du lien', () => {
    // La carte n'a pas d'adresse propre ; seule la fiche en a une.
    expect(monter({ details: ['Un point'] }).find('.actions__item--copie').exists()).toBe(false)
  })
})

describe('variante fiche', () => {
  it('n\'offre pas « En savoir plus » : on y est déjà', () => {
    expect(monter({ details: ['Un point'] }, 'fiche').find('.actions__item--detail').exists()).toBe(false)
  })

  it('propose de copier l\'adresse partageable', () => {
    // Le lien profond existe depuis longtemps sans que rien ne le laisse
    // deviner.
    expect(monter({}, 'fiche').find('.actions__item--copie').exists()).toBe(true)
  })

  it('copie l\'adresse de la fiche, slug compris', async () => {
    const ecrire = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: ecrire } })

    const rendu = monter({}, 'fiche')
    await rendu.get('.actions__item--copie').trigger('click')

    expect(ecrire).toHaveBeenCalledWith(expect.stringContaining('#projet/serveur-et-client-ftp-en-go'))
  })

  it('annonce l\'issue de la copie dans une région dédiée', async () => {
    // Le nom accessible d'un élément déjà focalisé n'est pas réannoncé de
    // façon fiable.
    const ecrire = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: ecrire } })

    const rendu = monter({}, 'fiche')
    expect(rendu.get('[role="status"]').text()).toBe('')

    await rendu.get('.actions__item--copie').trigger('click')
    await rendu.vm.$nextTick()

    expect(rendu.get('[role="status"]').text()).toBe('Lien copié')
  })

  it('signale un échec de copie plutôt que de rester muet', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: vi.fn().mockRejectedValue(new Error('refusé')) } })

    const rendu = monter({}, 'fiche')
    await rendu.get('.actions__item--copie').trigger('click')
    await rendu.vm.$nextTick()

    expect(libelles(rendu)).toContain('Copie impossible')
  })
})
