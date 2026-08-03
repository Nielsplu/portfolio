// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Monte une fenêtre minimale pilotée par useModale, avec un cadre intérieur
 * pour distinguer le clic hors cadre du clic dedans.
 */
function monterModale(options: { fermerAuClicExterieur?: boolean } = {}) {
  const ouverte = ref(false)
  const fermer = vi.fn(() => { ouverte.value = false })
  const surOuverture = vi.fn()

  const composant = mount(defineComponent({
    setup() {
      const { dialogue, attributs } = useModale({
        ouverte: () => ouverte.value,
        fermer,
        surOuverture,
        ...options,
      })
      return { dialogue, attributs }
    },
    template: '<dialog ref="dialogue" v-bind="attributs"><div class="cadre">contenu</div></dialog>',
  }), { attachTo: document.body })

  const dialogue = composant.element as HTMLDialogElement
  return { ouverte, fermer, surOuverture, composant, dialogue }
}

afterEach(() => {
  document.body.style.removeProperty('overflow')
  document.body.innerHTML = ''
})

describe('useModale', () => {
  it('ouvre la fenêtre et verrouille le défilement', async () => {
    const { ouverte, composant, dialogue } = monterModale()

    ouverte.value = true
    await composant.vm.$nextTick()

    expect(dialogue.open).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('referme et rend le défilement', async () => {
    const { ouverte, composant, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    ouverte.value = false
    await composant.vm.$nextTick()

    expect(dialogue.open).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('signale l\'ouverture une fois le DOM à jour', async () => {
    const { ouverte, composant, surOuverture } = monterModale()
    expect(surOuverture).not.toHaveBeenCalled()

    ouverte.value = true
    await composant.vm.$nextTick()
    await composant.vm.$nextTick()

    expect(surOuverture).toHaveBeenCalledTimes(1)
  })

  it('demande la fermeture sur Échap sans attendre l\'événement close', async () => {
    // C'est tout l'enjeu : `close` n'est pas toujours émis, et l'état resterait
    // ouvert alors que la fenêtre a disparu — page verrouillée, réouverture
    // impossible.
    const { ouverte, composant, fermer, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    const evenement = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    dialogue.dispatchEvent(evenement)

    expect(fermer).toHaveBeenCalledTimes(1)
    // Le défaut natif est neutralisé : une seule voie ferme la fenêtre.
    expect(evenement.defaultPrevented).toBe(true)
  })

  it('laisse passer les autres touches', async () => {
    const { ouverte, composant, fermer, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    dialogue.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))

    expect(fermer).not.toHaveBeenCalled()
  })

  it('ferme au clic hors du cadre', async () => {
    const { ouverte, composant, fermer, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    dialogue.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(fermer).toHaveBeenCalledTimes(1)
  })

  it('ne ferme pas au clic dans le cadre', async () => {
    const { ouverte, composant, fermer, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    dialogue.querySelector('.cadre')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(fermer).not.toHaveBeenCalled()
  })

  it('ignore le clic extérieur quand la fenêtre le refuse', async () => {
    // La démo FTP y perdrait sa session et 4,4 Mo de binaire.
    const { ouverte, composant, fermer, dialogue } = monterModale({ fermerAuClicExterieur: false })
    ouverte.value = true
    await composant.vm.$nextTick()

    dialogue.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(fermer).not.toHaveBeenCalled()
  })

  it('relaie une fermeture native par l\'événement close', async () => {
    // Filet pour toute fermeture qu'on n'aurait pas interceptée.
    const { ouverte, composant, fermer, dialogue } = monterModale()
    ouverte.value = true
    await composant.vm.$nextTick()

    dialogue.dispatchEvent(new Event('close'))

    expect(fermer).toHaveBeenCalledTimes(1)
  })
})
