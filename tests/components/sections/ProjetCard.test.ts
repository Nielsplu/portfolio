// @vitest-environment nuxt
import type { Projet } from '~/types/content'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjetCard from '~/components/sections/ProjetCard.vue'

const BASE: Projet = {
  titre: 'Serveur et client FTP en Go',
  sousTitre: 'Projet universitaire',
  description: 'Serveur et client FTP écrits en Go.',
  tags: ['Go', 'Concurrence'],
  categorie: 'Backend & DevOps',
}

function monter(projet: Partial<Projet> = {}, autres: Record<string, unknown> = {}) {
  return mount(ProjetCard, {
    props: { projet: { ...BASE, ...projet }, ...autres },
    // TechList est auto-importé : hors application, il faut le remplacer.
    global: { stubs: { TechList: true } },
  })
}

describe('ProjetCard', () => {
  it('n\'offre « En savoir plus » que s\'il y a de la matière à montrer', () => {
    // Un bouton sans contenu derrière promettrait une fenêtre vide.
    expect(monter().find('.project__link--detail').exists()).toBe(false)
    expect(monter({ details: ['Un point'] }).find('.project__link--detail').exists()).toBe(true)
    expect(monter({ images: [{ src: '/a.png', alt: 'Capture' }] }).find('.project__link--detail').exists()).toBe(true)
  })

  it('suffixe le bouton du titre pour les lecteurs d\'écran', () => {
    // Sans cela, six cartes porteraient six boutons au même nom.
    const carte = monter({ details: ['Un point'] })
    expect(carte.find('.project__link--detail .sr-only').text()).toContain(BASE.titre)
  })

  it('annonce l\'ouverture de la fiche', async () => {
    const carte = monter({ details: ['Un point'] })
    await carte.find('.project__link--detail').trigger('click')
    expect(carte.emitted('ouvrir-detail')).toHaveLength(1)
  })

  it('n\'offre le bouton de démo que si le projet en déclare une', async () => {
    expect(monter().find('.project__link--demo').exists()).toBe(false)

    const carte = monter({ demo: 'ftp' })
    await carte.find('.project__link--demo').trigger('click')
    expect(carte.emitted('ouvrir-demo')).toHaveLength(1)
  })

  it('ouvre les liens externes dans un nouvel onglet, sans fuite d\'opener', () => {
    const carte = monter({ liens: [{ label: 'Code', url: 'https://github.com/Nielsplu/ftp-go' }] })
    const lien = carte.findAll('.project__link').find(a => a.text().includes('Code'))!

    expect(lien.attributes('target')).toBe('_blank')
    expect(lien.attributes('rel')).toContain('noopener')
  })

  it('signale un dépôt privé plutôt que de n\'afficher aucune action', () => {
    expect(monter({ codePrive: true }).find('.project__prive').text()).toBe('Code privé')
  })

  it('n\'affiche pas la barre d\'actions quand il n\'y a rien à y mettre', () => {
    expect(monter().find('.project__links').exists()).toBe(false)
  })

  it('ne porte le nom de transition que lorsque la section le demande', () => {
    // Le nom doit rester unique dans la page : la section ne le pose que sur
    // une carte à la fois.
    // Le gabarit s'ouvrant sur des commentaires, la racine du composant est un
    // fragment : on vise l'article plutôt que le wrapper.
    expect(monter().get('article').classes()).not.toContain('project--morphe')
    expect(monter({}, { morphe: true }).get('article').classes()).toContain('project--morphe')
  })

  it('laisse l\'attribut style à la directive d\'apparition', () => {
    // Une liaison `:style` ici écrasait le --reveal-delay posé au rendu serveur,
    // et les cartes perdaient leur cascade.
    expect(monter({}, { morphe: true }).get('article').attributes('style')).toBeUndefined()
  })
})
