// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

// `onBeforeUnmount` impose un contexte de composant : on en monte un jetable
// dont on récupère le retour du composable.
function monterAvecVerrou() {
  let api!: ReturnType<typeof useVerrouDefilement>
  const composant = mount(defineComponent({
    setup() {
      api = useVerrouDefilement()
      return () => null
    },
  }))
  return { api, composant }
}

/** Simule une barre de défilement de `largeur` pixels. */
function simulerBarreDeDefilement(largeur: number) {
  Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true })
  Object.defineProperty(document.documentElement, 'clientWidth', { value: 1000 - largeur, configurable: true })
}

afterEach(() => {
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
})

describe('useVerrouDefilement', () => {
  it('bloque puis rend le défilement du corps', () => {
    const { api } = monterAvecVerrou()

    api.verrouiller(true)
    expect(document.body.style.overflow).toBe('hidden')

    api.verrouiller(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('compense la largeur de la barre de défilement qui disparaît', () => {
    // Sans compensation, la page saute latéralement de cette largeur.
    simulerBarreDeDefilement(17)
    const { api } = monterAvecVerrou()

    api.verrouiller(true)
    expect(document.body.style.paddingRight).toBe('17px')

    api.verrouiller(false)
    expect(document.body.style.paddingRight).toBe('')
  })

  it('n\'ajoute aucun remplissage sans barre de défilement', () => {
    // Sur mobile ou barre en surimpression : compenser décalerait la page.
    simulerBarreDeDefilement(0)
    const { api } = monterAvecVerrou()

    api.verrouiller(true)

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('déverrouille au démontage', () => {
    // Filet : une fenêtre détruite sans passer par sa fermeture laisserait
    // sinon la page figée pour de bon.
    const { api, composant } = monterAvecVerrou()
    api.verrouiller(true)
    expect(document.body.style.overflow).toBe('hidden')

    composant.unmount()

    expect(document.body.style.overflow).toBe('')
  })
})
