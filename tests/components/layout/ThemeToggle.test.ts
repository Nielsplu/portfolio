// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import { CLE_THEME } from '~/composables/useTheme'

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
})

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  delete document.documentElement.dataset.themeBascule
})

describe('ThemeToggle', () => {
  it('ne rend aucun état, pour ne rien faire diverger à l\'hydratation', () => {
    // Le serveur ignore le thème du visiteur : position du repère et libellé
    // sont décidés par le CSS d'après `data-theme`.
    const html = mount(ThemeToggle).html()

    expect(html).not.toMatch(/aria-pressed|aria-checked/)
    // Les deux libellés sont rendus ; le CSS en masque un.
    expect(html).toContain('Passer au thème sombre')
    expect(html).toContain('Passer au thème clair')
  })

  it('passe au sombre depuis le clair', async () => {
    document.documentElement.dataset.theme = 'light'
    const bouton = mount(ThemeToggle)

    await bouton.get('button').trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('revient au clair depuis le sombre', async () => {
    document.documentElement.dataset.theme = 'dark'
    const bouton = mount(ThemeToggle)

    await bouton.get('button').trigger('click')

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('part du clair quand aucun thème n\'est encore posé', async () => {
    // Sans attribut, `actuel()` répond « clair » : un premier clic doit donc
    // basculer vers le sombre.
    const bouton = mount(ThemeToggle)

    await bouton.get('button').trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('mémorise le choix pour les visites suivantes', async () => {
    const bouton = mount(ThemeToggle)

    await bouton.get('button').trigger('click')

    expect(localStorage.getItem(CLE_THEME)).toBe('dark')
  })

  it('coupe les transitions le temps du changement', async () => {
    // Sans cette coupure, une propriété transitionnée reste figée sur son
    // ancienne couleur (voir motion.css).
    const bouton = mount(ThemeToggle)

    await bouton.get('button').trigger('click')

    expect(document.documentElement.dataset.themeBascule).toBe('')
  })

  it('reste utilisable si le stockage local est refusé', async () => {
    // Navigation privée ou quota : le thème doit tout de même s'appliquer.
    const vrai = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('quota') }

    const bouton = mount(ThemeToggle)
    await bouton.get('button').trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
    Storage.prototype.setItem = vrai
  })
})
