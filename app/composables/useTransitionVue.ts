// Enveloppe de l'API View Transitions.
//
// Nuxt propose `experimental.viewTransition`, mais uniquement pour les
// changements de route : ici la fiche projet est une fenêtre ouverte sur la
// même page, il faut donc appeler l'API directement.

interface TransitionVue {
  finished: Promise<void>
}
type DemarrerTransition = (mutation: () => void | Promise<void>) => TransitionVue

/**
 * Applique une mutation d'état dans une transition animée quand le navigateur
 * la gère, et telle quelle sinon. Le repli n'est pas dégradé : c'est le
 * comportement instantané d'avant.
 *
 * Une animation non désirée est pire que pas d'animation : le réglage système
 * « réduire les animations » court-circuite la transition.
 *
 * @example
 * await transitionner(() => { projetOuvert.value = projet })
 */
export async function transitionner(mutation: () => void | Promise<void>): Promise<void> {
  const demarrer = (document as Document & { startViewTransition?: DemarrerTransition }).startViewTransition
  const animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (typeof demarrer !== 'function' || animationsReduites) {
    await mutation()
    return
  }

  // `.call` : la méthode a besoin de son `document` d'origine.
  const transition = demarrer.call(document, async () => {
    await mutation()
    // Sans ce tick, l'instantané « après » est pris avant que Vue n'ait rendu.
    await nextTick()
  })

  try {
    await transition.finished
  }
  catch {
    // Transition interrompue — navigation, onglet masqué : sans effet sur
    // l'état, la mutation a déjà eu lieu.
  }
}
