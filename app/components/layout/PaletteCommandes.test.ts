// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PaletteCommandes from './PaletteCommandes.vue'

async function monter() {
  const palette = mount(PaletteCommandes, { attachTo: document.body })
  const { ouvrir, fermer } = usePalette()

  const rafraichir = async () => {
    await palette.vm.$nextTick()
    await palette.vm.$nextTick()
  }
  const saisir = async (texte: string) => {
    await palette.get('.palette__champ').setValue(texte)
    await rafraichir()
  }
  const libelles = () => palette.findAll('.palette__libelle').map(e => e.text())
  const actif = () => palette.find('.palette__option--actif').exists()
    ? palette.get('.palette__option--actif .palette__libelle').text()
    : null
  const touche = async (key: string) => {
    await palette.get('.palette__champ').trigger('keydown', { key })
    await rafraichir()
  }

  ouvrir()
  await rafraichir()
  return { palette, fermer, saisir, libelles, actif, touche, rafraichir }
}

afterEach(() => {
  usePalette().fermer()
  document.body.style.removeProperty('overflow')
  document.body.innerHTML = ''
})

describe('PaletteCommandes', () => {
  it('s\'ouvre sur l\'état partagé et donne le focus à la recherche', async () => {
    const { palette } = await monter()

    expect((palette.element as HTMLDialogElement).open).toBe(true)
    expect(document.activeElement).toBe(palette.get('.palette__champ').element)
  })

  it('liste toutes les commandes tant qu\'on n\'a rien tapé', async () => {
    const { libelles } = await monter()

    expect(libelles().length).toBeGreaterThan(10)
    expect(libelles()).toContain('Aller à Projets')
  })

  it('ne garde que le CV pour « cv »', async () => {
    // Deux lettres suffisaient à toucher la moitié des titres avant le garde
    // de densité.
    const { saisir, libelles } = await monter()
    await saisir('cv')

    expect(libelles()).toEqual(['Ouvrir le CV'])
  })

  it('trouve un projet par une techno absente de son titre', async () => {
    const { saisir, libelles } = await monter()
    await saisir('prisma')

    expect(libelles()).toEqual(['Warhammer 40k Army Builder'])
  })

  it('affiche un état vide nommant la recherche', async () => {
    const { saisir, palette, libelles } = await monter()
    await saisir('xqzw')

    expect(libelles()).toEqual([])
    expect(palette.get('.palette__vide').text()).toContain('xqzw')
  })

  it('parcourt les résultats aux flèches, en bouclant', async () => {
    const { touche, actif, libelles } = await monter()
    const tous = libelles()
    expect(actif()).toBe(tous[0])

    await touche('ArrowDown')
    expect(actif()).toBe(tous[1])

    await touche('ArrowUp')
    expect(actif()).toBe(tous[0])

    // Depuis le premier, on revient au dernier.
    await touche('ArrowUp')
    expect(actif()).toBe(tous[tous.length - 1])
  })

  it('revient au premier résultat à chaque frappe', async () => {
    // Garder l'ancien rang désignerait une commande sans rapport.
    const { touche, saisir, actif, libelles } = await monter()
    await touche('ArrowDown')
    await touche('ArrowDown')

    await saisir('aller')

    expect(actif()).toBe(libelles()[0])
  })

  it('désigne l\'option active pour les lecteurs d\'écran', async () => {
    const { palette, touche } = await monter()
    const idInitial = palette.get('.palette__champ').attributes('aria-activedescendant')
    expect(idInitial).toBeTruthy()

    await touche('ArrowDown')

    expect(palette.get('.palette__champ').attributes('aria-activedescendant')).not.toBe(idInitial)
  })

  it('exécute la commande active sur Entrée et se referme', async () => {
    const { palette, saisir, touche } = await monter()
    await saisir('contact')

    await touche('Enter')

    expect(window.location.hash).toBe('#contact')
    expect((palette.element as HTMLDialogElement).open).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('copie l\'adresse e-mail sans quitter la page', async () => {
    const ecrire = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: ecrire } })

    const { saisir, touche } = await monter()
    await saisir('mail')
    await touche('Enter')

    expect(ecrire).toHaveBeenCalledWith('pluniels@gmail.com')
    vi.unstubAllGlobals()
  })

  it('n\'exécute rien quand aucune commande ne correspond', async () => {
    const { palette, saisir, touche } = await monter()
    const avant = window.location.hash
    await saisir('xqzw')

    await touche('Enter')

    expect(window.location.hash).toBe(avant)
    expect((palette.element as HTMLDialogElement).open).toBe(true)
  })
})
