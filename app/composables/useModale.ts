// Socle commun des fenêtres modales : ouverture, verrou de défilement,
// fermeture par Échap et clic hors cadre.
//
// Les trois modales du site (palette de commandes, fiche projet, démo FTP)
// réimplémentaient chacune la même mécanique. La palette s'est retrouvée
// déphasée — Échap laissait la page verrouillée et il fallait deux Ctrl+K pour
// rouvrir — parce que deux endroits fermaient le dialogue. Ici un seul le fait.

export interface OptionsModale {
  /** Ouverte ou non. Le composable suit cette source, il ne l'écrit jamais. */
  ouverte: () => boolean
  /** Demande la fermeture au propriétaire de l'état. */
  fermer: () => void
  /** Après ouverture, une fois le DOM à jour. */
  surOuverture?: () => void
  /**
   * Un clic hors du cadre ferme. À laisser à `false` là où la fermeture
   * accidentelle coûte cher — la démo FTP perdrait sa session.
   */
  fermerAuClicExterieur?: boolean
}

/**
 * @example
 * const { dialogue, attributs } = useModale({
 *   ouverte: () => props.projet !== null,
 *   fermer: () => emit('fermer'),
 * })
 */
export function useModale(options: OptionsModale) {
  const dialogue = ref<HTMLDialogElement>()
  const { verrouiller } = useVerrouDefilement()

  function afficher() {
    // `showModal()` lève une exception sur un dialogue déjà ouvert, et
    // l'exception traverserait le watch en laissant l'état à moitié appliqué.
    // Le cas se présente dès que deux sources demandent l'ouverture — lien
    // profond au chargement, clic, palette de commandes.
    if (dialogue.value && !dialogue.value.open) dialogue.value.showModal()
    verrouiller(true)
    nextTick(() => options.surOuverture?.())
  }

  function masquer() {
    // Sans effet si le navigateur a déjà refermé nativement.
    if (dialogue.value?.open) dialogue.value.close()
    verrouiller(false)
  }

  // Seul endroit qui touche au DOM : tout le reste ne fait que poser l'état.
  watch(options.ouverte, visible => (visible ? afficher() : masquer()))

  onMounted(() => {
    // Déjà ouverte au montage — modale montée à la demande : le watch ne se
    // déclencherait pas.
    if (options.ouverte()) afficher()
  })

  const attributs = {
    // Échap est intercepté avant la fermeture native plutôt que d'attendre
    // l'événement `close` : celui-ci n'est pas toujours émis, et l'état
    // resterait alors ouvert alors que la fenêtre a disparu — page verrouillée
    // et impossible à rouvrir.
    onKeydown: (evenement: KeyboardEvent) => {
      if (evenement.key !== 'Escape') return
      evenement.preventDefault()
      options.fermer()
    },
    // Filet pour toute fermeture native qu'on n'aurait pas interceptée.
    onClose: () => options.fermer(),
    onClick: (evenement: MouseEvent) => {
      if (options.fermerAuClicExterieur === false) return
      // La cible n'est le dialogue lui-même que hors du cadre intérieur.
      if (evenement.target === dialogue.value) options.fermer()
    },
  }

  return { dialogue, attributs }
}
