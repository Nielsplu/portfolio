// Bascule du thème clair / sombre.
//
// Le CSS porte les deux palettes, le script en <head> pose `data-theme` avant
// le premier paint, et ce composable ne fait que lire et écrire cet attribut.
// Rien n'est rendu côté serveur, donc aucun écart d'hydratation possible.

export type Theme = 'light' | 'dark'

/** À garder synchronisée avec le script anti-flash de nuxt.config.ts. */
export const CLE_THEME = 'niels-theme'

/**
 * @example
 * const { basculer } = useTheme()
 * basculer()
 */
export function useTheme() {
  function actuel(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  }

  function appliquer(theme: Theme) {
    const racine = document.documentElement

    // Transitions coupées le temps du changement (voir motion.css), sinon une
    // propriété transitionnée reste figée sur son ancienne couleur.
    racine.dataset.themeBascule = ''
    racine.dataset.theme = theme
    void racine.offsetHeight
    // setTimeout et non rAF : ce dernier est gelé dans un onglet en arrière-plan
    // et les transitions resteraient coupées.
    setTimeout(() => {
      delete racine.dataset.themeBascule
    }, 0)

    try {
      localStorage.setItem(CLE_THEME, theme)
    }
    catch {
      // Navigation privée ou quota : le thème reste appliqué pour la session.
    }
  }

  function basculer() {
    appliquer(actuel() === 'dark' ? 'light' : 'dark')
  }

  return { actuel, appliquer, basculer }
}
