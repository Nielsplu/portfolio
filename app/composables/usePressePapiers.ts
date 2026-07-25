// Copie dans le presse-papiers, avec un retour visible pour le visiteur.
//
// Pourquoi ce composable plutôt qu'un simple lien mailto : un `mailto:` ne mène
// à rien pour qui n'a pas de client mail configuré (cas courant sur poste
// partagé ou webmail seul). Pouvoir copier l'adresse évite l'impasse.
//
// L'API Clipboard exige un contexte sécurisé (HTTPS ou localhost) et peut être
// refusée. L'échec est donc traité explicitement, à charge de l'appelant
// d'afficher son propre repli — l'adresse reste de toute façon lisible en clair
// dans la page.

/** État de la dernière tentative de copie. */
export type EtatCopie = 'attente' | 'copie' | 'echec'

/**
 * Expose une fonction de copie et l'état du dernier essai, remis à `attente`
 * après un délai pour que le retour ne reste pas affiché indéfiniment.
 *
 * @example
 * const { copier, etat } = usePressePapiers()
 * await copier('pluniels@gmail.com')
 * // etat.value === 'copie' pendant 2 secondes
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
      // Contexte non sécurisé, permission refusée, ou API absente.
      etat.value = 'echec'
      minuteur = setTimeout(() => { etat.value = 'attente' }, delaiRetour)
      return false
    }
  }

  onBeforeUnmount(() => clearTimeout(minuteur))

  return { copier, etat }
}
