// @vitest-environment nuxt
import { afterEach, describe, expect, it, vi } from 'vitest'
import reveal from './reveal'

/** Faux nuxtApp : le plugin n'utilise que l'enregistrement de directive. */
function fauxNuxtApp() {
  const directives: Record<string, unknown> = {}
  return {
    app: { vueApp: { directive: (nom: string, def: unknown) => { directives[nom] = def } } },
    directives,
  }
}

type Directive = {
  getSSRProps: (binding: { value?: number }) => Record<string, unknown>
  mounted: (el: HTMLElement, binding: { value?: number }) => void
  unmounted: (el: HTMLElement) => void
}

function installer() {
  const faux = fauxNuxtApp()
  // Le plugin est appelé comme le ferait Nuxt, avec l'app en argument.
  ;(reveal as unknown as (app: unknown) => void)(faux.app)
  return faux.directives.reveal as Directive
}

afterEach(() => {
  delete window.__revelationSecours
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('directive reveal', () => {
  it('annule le filet de secours dès qu\'il tourne', () => {
    // Le script de tête masque le contenu avant que le bundle n'arrive, et
    // arme un délai qui le redévoile si le bundle n'arrive jamais. Le plugin
    // qui démarre est la preuve que le bundle est là.
    const annuler = vi.spyOn(globalThis, 'clearTimeout')
    window.__revelationSecours = setTimeout(() => {}, 10_000)
    const filet = window.__revelationSecours

    installer()

    expect(annuler).toHaveBeenCalledWith(filet)
    annuler.mockRestore()
  })

  it('ne se plaint pas si aucun filet n\'a été armé', () => {
    // Sans IntersectionObserver, le script de tête n'arme rien.
    expect(() => installer()).not.toThrow()
  })

  it('enregistre le délai d\'échelonnement au rendu serveur', () => {
    const directive = installer()
    expect(directive.getSSRProps({ value: 120 })).toEqual({ style: { '--reveal-delay': '120ms' } })
  })

  it('n\'écrit aucun style quand il n\'y a pas de délai', () => {
    // Un style vide écraserait l'attribut et casserait l'hydratation.
    const directive = installer()
    expect(directive.getSSRProps({})).toEqual({})
  })

  it('pose la classe même si le gabarit l\'a oubliée', () => {
    const directive = installer()
    const el = document.createElement('div')

    directive.mounted(el, {})

    expect(el.classList.contains('reveal')).toBe(true)
  })

  it('reporte le délai sur l\'élément au montage', () => {
    const directive = installer()
    const el = document.createElement('div')

    directive.mounted(el, { value: 60 })

    expect(el.style.getPropertyValue('--reveal-delay')).toBe('60ms')
  })

  it('cesse d\'observer un élément démonté', () => {
    const cesser = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve(...args: unknown[]) { cesser(...args) }
      disconnect() {}
    })

    const directive = installer()
    const el = document.createElement('div')
    directive.mounted(el, {})
    directive.unmounted(el)

    expect(cesser).toHaveBeenCalledWith(el)
  })
})
