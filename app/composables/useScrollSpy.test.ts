// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Rappel = (entrees: Array<{ isIntersecting: boolean, target: { id: string } }>) => void

let rappel: Rappel
let observes: string[]
let deconnexions: number

/** IntersectionObserver de substitution : on déclenche nous-mêmes les entrées. */
class ObservateurFactice {
  constructor(cb: Rappel, public options: unknown) {
    rappel = cb
  }

  observe(el: Element) { observes.push(el.id) }
  disconnect() { deconnexions++ }
  unobserve() {}
}

/**
 * @param ids  ids passés au composable
 * @param presents  ids réellement rendus dans la page ; par défaut, tous
 */
function monterEspion(ids: string[], presents: string[] = ids) {
  for (const id of presents) {
    const section = document.createElement('section')
    section.id = id
    document.body.append(section)
  }
  let actif!: ReturnType<typeof useScrollSpy>
  const composant = mount(defineComponent({
    setup() {
      actif = useScrollSpy(ids)
      return () => null
    },
  }))
  return { actif, composant }
}

beforeEach(() => {
  observes = []
  deconnexions = 0
  vi.stubGlobal('IntersectionObserver', ObservateurFactice)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('useScrollSpy', () => {
  it('part sur la première section, faute d\'avoir encore rien observé', () => {
    const { actif } = monterEspion(['projets', 'parcours'])
    expect(actif.value).toBe('projets')
  })

  it('observe chaque section dont l\'id existe dans la page', () => {
    monterEspion(['projets', 'parcours', 'contact'])
    expect(observes).toEqual(['projets', 'parcours', 'contact'])
  })

  it('ignore un id absent plutôt que d\'échouer', () => {
    // Une entrée de navigation pointant une section pas encore écrite ne doit
    // pas casser la mise en surbrillance des autres.
    monterEspion(['projets', 'section-fantome'], ['projets'])
    expect(observes).toEqual(['projets'])
  })

  it('suit la section qui entre dans la zone active', () => {
    const { actif } = monterEspion(['projets', 'parcours', 'contact'])

    rappel([{ isIntersecting: true, target: { id: 'parcours' } }])
    expect(actif.value).toBe('parcours')

    rappel([{ isIntersecting: true, target: { id: 'contact' } }])
    expect(actif.value).toBe('contact')
  })

  it('ne réagit pas à une section qui sort de la zone', () => {
    // Sortir n'implique pas qu'une autre soit entrée : garder la dernière
    // évite un état vide entre deux sections.
    const { actif } = monterEspion(['projets', 'parcours'])
    rappel([{ isIntersecting: true, target: { id: 'parcours' } }])

    rappel([{ isIntersecting: false, target: { id: 'parcours' } }])

    expect(actif.value).toBe('parcours')
  })

  it('resserre la zone active autour du milieu de l\'écran', () => {
    // Sans cette marge, deux sections seraient actives à la fois.
    let options: { rootMargin?: string } = {}
    vi.stubGlobal('IntersectionObserver', class extends ObservateurFactice {
      constructor(cb: Rappel, o: { rootMargin?: string }) { super(cb, o); options = o }
    })

    monterEspion(['projets'])

    expect(options.rootMargin).toBe('-45% 0px -50% 0px')
  })

  it('se débranche au démontage', () => {
    const { composant } = monterEspion(['projets'])
    composant.unmount()
    expect(deconnexions).toBe(1)
  })
})
