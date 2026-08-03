// Enveloppe de l'API View Transitions.
//
// Nuxt propose `experimental.viewTransition`, mais uniquement pour les
// changements de route : ici la fiche projet est une fenêtre ouverte sur la
// même page, il faut donc appeler l'API directement.

interface TransitionVue {
  /** Rejette si la transition est écartée avant de démarrer. */
  ready?: Promise<void>
  /** Rejette si la mutation elle-même échoue. */
  updateCallbackDone?: Promise<void>
  finished: Promise<void>
}
type DemarrerTransition = (mutation: () => void | Promise<void>) => TransitionVue

/**
 * Une seule transition à la fois. Le navigateur écarte celle en cours quand une
 * autre démarre — un aller-retour rapide entre deux fiches suffit — et la
 * suivante s'exécutait alors dans un état incohérent.
 */
let enCours = false

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

  if (typeof demarrer !== 'function' || animationsReduites || enCours) {
    await mutation()
    return
  }

  enCours = true
  try {
    // `.call` : la méthode a besoin de son `document` d'origine.
    const transition = demarrer.call(document, async () => {
      await mutation()
      // Sans ce tick, l'instantané « après » est pris avant que Vue n'ait rendu.
      await nextTick()
    })

    // Les trois promesses de l'API rejettent indépendamment. N'en surveiller
    // qu'une laissait les autres remonter en rejets non traités — six par
    // aller-retour observés en production, avec « Transition was aborted
    // because of invalid state » sur un onglet non rendu.
    transition.ready?.catch(() => {})
    transition.updateCallbackDone?.catch(() => {})

    await transition.finished
  }
  catch {
    // Transition interrompue — navigation, onglet masqué, transition
    // concurrente : sans effet sur l'état, la mutation a déjà eu lieu.
  }
  finally {
    enCours = false
  }
}
