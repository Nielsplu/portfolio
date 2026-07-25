// Bascule du thème clair / sombre.
//
// Répartition volontaire des rôles :
//   - le CSS (assets/css/tokens.css) porte les deux palettes, la sombre
//     surchargeant la claire sous `:root[data-theme='dark']` ;
//   - le script en <head> (nuxt.config.ts) résout le thème avant le premier
//     paint et le pose sur <html data-theme>, ce qui évite tout clignotement ;
//   - ce composable ne fait que LIRE et ÉCRIRE cet attribut.
//
// Aucun état n'est rendu côté serveur : l'apparence du bouton découle de
// `data-theme` en CSS, pas d'une valeur réactive. Il n'y a donc rien qui puisse
// diverger entre le HTML prérendu et l'hydratation.

/** Thèmes proposés au visiteur. */
export type Theme = 'light' | 'dark'

/** Clé de stockage du choix explicite du visiteur (partagée avec le script
 *  anti-flash de nuxt.config.ts — les deux doivent rester synchronisées). */
export const CLE_THEME = 'niels-theme'

/**
 * Expose la bascule de thème. À utiliser dans un composant client (le bouton
 * est masqué en CSS tant que `data-theme` n'est pas posé, donc sans JS).
 *
 * @example
 * const { basculer } = useTheme()
 * // Au clic : passe de clair à sombre, et mémorise le choix.
 * basculer()
 */
export function useTheme() {
  /** Thème actuellement appliqué, lu sur <html>. */
  function actuel(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  }

  /** Applique un thème et mémorise le choix pour les visites suivantes. */
  function appliquer(theme: Theme) {
    const racine = document.documentElement

    // Les transitions sont coupées le temps du changement (voir motion.css) :
    // une propriété transitionnée dont la couleur vient d'une variable de thème
    // resterait sinon figée sur son ancienne valeur.
    racine.dataset.themeBascule = ''
    racine.dataset.theme = theme
    // Lecture forcée : applique les nouvelles couleurs tant que les transitions
    // sont neutralisées, avant de les rétablir pour les survols à venir.
    void racine.offsetHeight
    // setTimeout plutôt que requestAnimationFrame : dans un onglet en
    // arrière-plan, rAF est gelé — l'attribut n'était jamais retiré et les
    // transitions restaient coupées pour le reste de la visite.
    setTimeout(() => {
      delete racine.dataset.themeBascule
    }, 0)

    // Le stockage peut échouer (navigation privée stricte, quota) : le thème
    // doit rester appliqué pour la session même si on ne peut pas le retenir.
    try {
      localStorage.setItem(CLE_THEME, theme)
    }
    catch {
      // Choix non mémorisé : sans conséquence sur l'affichage courant.
    }
  }

  /** Inverse le thème courant. */
  function basculer() {
    appliquer(actuel() === 'dark' ? 'light' : 'dark')
  }

  return { actuel, appliquer, basculer }
}
