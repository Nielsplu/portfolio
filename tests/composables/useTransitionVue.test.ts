// @vitest-environment nuxt
import { afterEach, describe, expect, it, vi } from 'vitest'
import { transitionner } from '~/composables/useTransitionVue'

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

  it('attache un gestionnaire à chacune des trois promesses', async () => {
    // Se fier à `unhandledrejection` ne prouve rien : l'événement n'est pas
    // émis de façon fiable sous vitest, et le test passait même sans la
    // correction. On vérifie donc directement que le code consomme chaque
    // promesse — c'est ce qui manquait, et six rejets non traités par
    // aller-retour remontaient en production.
    reglerAnimationsReduites(false)

    const surveiller = (raison: string) => {
      const promesse = Promise.reject(new Error(raison))
      const espion = vi.fn()
      const vraiCatch = promesse.catch.bind(promesse)
      promesse.catch = (fn?: never) => { espion(); return vraiCatch(fn) }
      // Filet : sans ce gestionnaire, le rejet ferait tomber la suite.
      vraiCatch(() => {})
      return { promesse, espion }
    }

    const pret = surveiller('écartée')
    const mutationFaite = surveiller('mutation en échec')

    Object.defineProperty(document, 'startViewTransition', {
      value: (cb: () => Promise<void>) => ({
        ready: pret.promesse,
        updateCallbackDone: mutationFaite.promesse,
        finished: cb(),
      }),
      configurable: true,
    })

    await transitionner(() => {})

    expect(pret.espion, 'ready non surveillée').toHaveBeenCalled()
    expect(mutationFaite.espion, 'updateCallbackDone non surveillée').toHaveBeenCalled()
  })

  it('n\'imbrique jamais deux transitions', async () => {
    // Le navigateur écarte celle en cours quand une autre démarre ; la
    // seconde s'exécutait alors dans un état incohérent.
    reglerAnimationsReduites(false)
    let demarrages = 0
    let liberer: (() => void) | undefined
    const enAttente = new Promise<void>((r) => { liberer = r })

    Object.defineProperty(document, 'startViewTransition', {
      value: (cb: () => Promise<void>) => {
        demarrages++
        return { ready: Promise.resolve(), finished: cb().then(() => enAttente) }
      },
      configurable: true,
    })

    const premiere = transitionner(() => {})
    await new Promise(r => setTimeout(r, 10))
    const seconde = transitionner(() => {})
    await seconde

    // La seconde s'applique directement plutôt que de couper la première.
    expect(demarrages).toBe(1)
    liberer!()
    await premiere
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
