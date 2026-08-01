import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CLE_THEME, useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    delete document.documentElement.dataset.themeBascule
    localStorage.clear()
    vi.useRealTimers()
  })

  it('considère le thème clair par défaut, sans attribut', () => {
    expect(useTheme().actuel()).toBe('light')
  })

  it('lit le thème depuis l\'attribut de <html>', () => {
    document.documentElement.dataset.theme = 'dark'
    expect(useTheme().actuel()).toBe('dark')
  })

  it('applique le thème et le mémorise', () => {
    useTheme().appliquer('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(CLE_THEME)).toBe('dark')
  })

  it('inverse le thème courant', () => {
    const { basculer } = useTheme()
    basculer()
    expect(document.documentElement.dataset.theme).toBe('dark')
    basculer()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('pose le garde-fou des transitions puis le retire', async () => {
    vi.useFakeTimers()
    useTheme().appliquer('dark')
    // Pendant la bascule, l'attribut coupe les transitions (voir motion.css) :
    // sans lui, une couleur transitionnée reste figée sur son ancienne valeur.
    expect('themeBascule' in document.documentElement.dataset).toBe(true)
    vi.runAllTimers()
    // Et il doit repartir, sinon les survols restent sans animation pour le
    // reste de la visite.
    expect('themeBascule' in document.documentElement.dataset).toBe(false)
  })

  it('applique quand même le thème si le stockage échoue', () => {
    // Navigation privée stricte ou quota dépassé.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => useTheme().appliquer('dark')).not.toThrow()
    expect(document.documentElement.dataset.theme).toBe('dark')
    vi.restoreAllMocks()
  })
})
