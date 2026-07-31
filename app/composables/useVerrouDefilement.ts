// Verrou de défilement pour les fenêtres modales.
//
// `<dialog>` rend l'arrière-plan inerte au clic, mais la molette continue de
// faire défiler la page derrière : on se retrouve ailleurs en refermant.

/**
 * Le déverrouillage est aussi câblé au démontage : sans ce filet, une fenêtre
 * détruite sans passer par sa fermeture laisserait la page figée.
 *
 * @example
 * const { verrouiller } = useVerrouDefilement()
 * verrouiller(true)
 */
export function useVerrouDefilement() {
  function verrouiller(actif: boolean) {
    if (import.meta.server) return
    const corps = document.body
    if (actif) {
      // Compense la barre de défilement qui disparaît, sinon la page saute
      // latéralement de sa largeur.
      const largeurBarre = window.innerWidth - document.documentElement.clientWidth
      corps.style.overflow = 'hidden'
      if (largeurBarre > 0) corps.style.paddingRight = `${largeurBarre}px`
    }
    else {
      corps.style.removeProperty('overflow')
      corps.style.removeProperty('padding-right')
    }
  }

  onBeforeUnmount(() => verrouiller(false))

  return { verrouiller }
}
