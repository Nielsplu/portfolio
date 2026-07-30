// Verrou de défilement de la page, pour les fenêtres modales.
//
// `<dialog>` ouvert par showModal() rend bien l'arrière-plan inerte au clic,
// mais la molette et le geste tactile continuent de faire défiler la page
// derrière : on se retrouve ailleurs sur le site en refermant.
//
// Extrait de la démo FTP quand une seconde fenêtre en a eu besoin : deux copies
// de cette logique auraient dérivé, et surtout un verrou oublié fige la page
// entière — le genre de bug qu'on ne remarque qu'en production.

/**
 * Verrouille et déverrouille le défilement du corps de page.
 *
 * Le déverrouillage est aussi câblé au démontage du composant : sans ce filet,
 * une fenêtre détruite sans repasser par sa fermeture laisserait la page figée.
 *
 * @example
 * const { verrouiller } = useVerrouDefilement()
 * verrouiller(true)  // à l'ouverture de la fenêtre
 * verrouiller(false) // à sa fermeture
 */
export function useVerrouDefilement() {
  function verrouiller(actif: boolean) {
    if (import.meta.server) return
    const corps = document.body
    if (actif) {
      // La barre de défilement disparaît avec `overflow: hidden` : sans
      // compensation, toute la page saute latéralement de sa largeur.
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
