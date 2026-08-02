// État partagé de la palette de commandes : la barre de navigation l'ouvre,
// PaletteCommandes la rend. `useState` et non un ref de module, qui fuirait
// d'une requête SSR à l'autre.

/**
 * @example
 * const { ouvrir } = usePalette()
 */
export function usePalette() {
  // Fermée au premier rendu des deux côtés : aucun écart d'hydratation.
  const ouverte = useState('palette-ouverte', () => false)

  return {
    ouverte,
    ouvrir: () => { ouverte.value = true },
    fermer: () => { ouverte.value = false },
    basculer: () => { ouverte.value = !ouverte.value },
  }
}
