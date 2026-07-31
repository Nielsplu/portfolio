// Copie dans le presse-papiers, avec retour visible.
//
// Un `mailto:` ne mène à rien sans client mail configuré. L'API Clipboard exige
// un contexte sécurisé et peut être refusée : l'échec est traité explicitement,
// l'adresse restant lisible en clair dans la page.

/** État de la dernière tentative. */
export type EtatCopie = 'attente' | 'copie' | 'echec'

/**
 * L'état revient à `attente` après un délai, sinon le retour resterait affiché.
 *
 * @example
 * const { copier, etat } = usePressePapiers()
 * await copier('pluniels@gmail.com') // etat vaut 'copie' pendant 2 s
 */
export function usePressePapiers(delaiRetour = 2000) {
  const etat = ref<EtatCopie>('attente')
  let minuteur: ReturnType<typeof setTimeout> | undefined

  async function copier(texte: string): Promise<boolean> {
    clearTimeout(minuteur)
    try {
      await navigator.clipboard.writeText(texte)
      etat.value = 'copie'
      minuteur = setTimeout(() => { etat.value = 'attente' }, delaiRetour)
      return true
    }
    catch {
      // Contexte non sécurisé, permission refusée ou API absente.
      etat.value = 'echec'
      minuteur = setTimeout(() => { etat.value = 'attente' }, delaiRetour)
      return false
    }
  }

  onBeforeUnmount(() => clearTimeout(minuteur))

  return { copier, etat }
}
