import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePressePapiers } from '~/composables/usePressePapiers'

/** Le composable pose un hook de démontage : il lui faut un composant hôte. */
function monter(delai = 2000) {
  let api!: ReturnType<typeof usePressePapiers>
  const hote = mount(defineComponent({
    setup() {
      api = usePressePapiers(delai)
      return () => null
    },
  }))
  return { api, hote }
}

/** Remplace l'API Clipboard, absente de l'environnement de test. */
function simulerPressePapiers(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

describe('usePressePapiers', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('part de l\'état d\'attente', () => {
    simulerPressePapiers(async () => {})
    expect(monter().api.etat.value).toBe('attente')
  })

  it('passe à « copie » et transmet le texte', async () => {
    const writeText = vi.fn(async () => {})
    simulerPressePapiers(writeText)
    const { api } = monter()

    await api.copier('pluniels@gmail.com')

    expect(writeText).toHaveBeenCalledWith('pluniels@gmail.com')
    expect(api.etat.value).toBe('copie')
  })

  it('passe à « echec » sans lever, quand l\'API refuse', async () => {
    // Contexte non sécurisé ou permission refusée : le visiteur doit être
    // prévenu, pas laissé devant un bouton qui semble ne rien faire.
    simulerPressePapiers(async () => { throw new Error('refusé') })
    const { api } = monter()

    await expect(api.copier('texte')).resolves.toBe(false)
    expect(api.etat.value).toBe('echec')
  })

  it('revient à l\'attente après le délai', async () => {
    vi.useFakeTimers()
    simulerPressePapiers(async () => {})
    const { api } = monter(2000)

    await api.copier('texte')
    expect(api.etat.value).toBe('copie')

    vi.advanceTimersByTime(2000)
    expect(api.etat.value).toBe('attente')
  })

  it('annule son minuteur au démontage', async () => {
    vi.useFakeTimers()
    const annuler = vi.spyOn(globalThis, 'clearTimeout')
    simulerPressePapiers(async () => {})
    const { api, hote } = monter()

    await api.copier('texte')
    annuler.mockClear()
    hote.unmount()

    // Sans ce nettoyage, le minuteur écrirait dans un composant détruit.
    expect(annuler).toHaveBeenCalled()
  })
})
