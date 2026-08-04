// @vitest-environment nuxt
import type { Projet } from '~/types/content'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjetCard from '~/components/sections/ProjetCard.vue'

// Les actions elles-mêmes sont vérifiées dans ProjetActions.test.ts : ce
// fichier ne couvre que ce qui appartient à la carte.

const BASE: Projet = {
  titre: 'Serveur et client FTP en Go',
  sousTitre: 'Projet universitaire — équipe de 3',
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
  it('rend le titre, le contexte et la description', () => {
    const carte = monter()
    expect(carte.get('.project__title').text()).toBe(BASE.titre)
    expect(carte.get('.project__kind').text()).toBe(BASE.sousTitre)
    expect(carte.get('.project__desc').text()).toBe(BASE.description)
  })

  it('relaie l\'ouverture de la fiche et de la démo', async () => {
    const carte = monter({ demo: 'ftp', details: ['Un point'] })

    await carte.get('.actions__item--detail').trigger('click')
    await carte.get('.actions__item--demo').trigger('click')

    expect(carte.emitted('ouvrir-detail')).toHaveLength(1)
    expect(carte.emitted('ouvrir-demo')).toHaveLength(1)
  })

  it('ne porte le nom de transition que lorsque la section le demande', () => {
    // Le nom doit rester unique dans la page : la section ne le pose que sur
    // une carte à la fois. Le gabarit s'ouvrant sur des commentaires, la racine
    // du composant est un fragment : on vise l'article plutôt que le wrapper.
    expect(monter().get('article').classes()).not.toContain('project--morphe')
    expect(monter({}, { morphe: true }).get('article').classes()).toContain('project--morphe')
  })

  it('laisse l\'attribut style à la directive d\'apparition', () => {
    // Une liaison `:style` ici écrasait le --reveal-delay posé au rendu serveur,
    // et les cartes perdaient leur cascade.
    expect(monter({}, { morphe: true }).get('article').attributes('style')).toBeUndefined()
  })

  it('nomme la liste de technologies d\'après le projet', () => {
    // Sans nom, la navigation par listes annonce « liste de 8 éléments » sans
    // dire de quoi il s'agit — et la page en aligne une dizaine.
    expect(monter().get('tech-list-stub').attributes('label')).toContain(BASE.titre)
  })
})
