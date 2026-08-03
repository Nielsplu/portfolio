// @vitest-environment nuxt
import { afterEach, describe, expect, it, vi } from 'vitest'
import { transitionner } from './useTransitionVue'

/** Remplace `matchMedia` pour décider du réglage « réduire les animations ». */
function reglerAnimationsReduites(reduites: boolean) {
  vi.stubGlobal('matchMedia', (requete: string) => ({
    matches: requete.includes('reduce') ? reduites : false,
    media: requete,
    addEventListener() {},
    removeEventListener() {},
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'startViewTransition')
})

describe('transitionner', () => {
  it('applique la mutation via l\'API quand elle existe', async () => {
    reglerAnimationsReduites(false)
    const mutation = vi.fn()
    const demarrer = vi.fn((cb: () => Promise<void>) => ({ finished: cb() }))
    Object.defineProperty(document, 'startViewTransition', { value: demarrer, configurable: true })

    await transitionner(mutation)

    expect(demarrer).toHaveBeenCalledTimes(1)
    expect(mutation).toHaveBeenCalledTimes(1)
  })

  it('applique la mutation telle quelle sans l\'API', async () => {
    // Repli non dégradé : c'est le comportement instantané d'avant.
    reglerAnimationsReduites(false)
    const mutation = vi.fn()

    await transitionner(mutation)

    expect(mutation).toHaveBeenCalledTimes(1)
  })

  it('court-circuite l\'API sous « réduire les animations »', async () => {
    // Une animation non désirée est pire que pas d'animation.
    reglerAnimationsReduites(true)
    const mutation = vi.fn()
    const demarrer = vi.fn((cb: () => Promise<void>) => ({ finished: cb() }))
    Object.defineProperty(document, 'startViewTransition', { value: demarrer, configurable: true })

    await transitionner(mutation)

    expect(demarrer).not.toHaveBeenCalled()
    expect(mutation).toHaveBeenCalledTimes(1)
  })

  it('rend la main même si la transition est interrompue', async () => {
    // Navigation ou onglet masqué : la mutation a déjà eu lieu, l'échec de
    // l'animation ne doit pas remonter à l'appelant.
    reglerAnimationsReduites(false)
    const mutation = vi.fn()
    Object.defineProperty(document, 'startViewTransition', {
      value: (cb: () => Promise<void>) => ({ finished: cb().then(() => Promise.reject(new Error('interrompue'))) }),
      configurable: true,
    })

    await expect(transitionner(mutation)).resolves.toBeUndefined()
    expect(mutation).toHaveBeenCalledTimes(1)
  })

  it('attend une mutation asynchrone', async () => {
    reglerAnimationsReduites(false)
    let termine = false
    const mutation = async () => {
      await new Promise(r => setTimeout(r, 10))
      termine = true
    }

    await transitionner(mutation)

    expect(termine).toBe(true)
  })
})
