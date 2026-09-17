// Logique pure de l'explorateur de fichiers de la démo FTP, isolée du composant
// pour être testable (le reste — pilotage du wasm, rendu — vit dans
// DemoFtpTerminal.vue).

/**
 * Fil d'Ariane à partir du chemin courant du serveur, exprimé relativement à
 * `data/` (vide à la racine, puis « /important », « /important/test »).
 *
 * @example filAriane('') // ['data']
 * @example filAriane('/important/test') // ['data', 'important', 'test']
 */
export function filAriane(chemin: string): string[] {
  return ['data', ...chemin.split('/').filter(Boolean)]
}

/**
 * Nombre de « Cd .. » à enchaîner pour remonter jusqu'au segment `index` du fil
 * d'Ariane (0 = racine « data »). Le dernier segment est le dossier courant :
 * cliquer dessus ne remonte de rien.
 */
export function remonteesVers(fil: readonly string[], index: number): number {
  return Math.max(0, fil.length - 1 - index)
}

/**
 * Commande déclenchée par un clic sur un fichier : le port admin masque, le
 * port client télécharge.
 */
export function commandeFichier(nom: string, admin: boolean): string {
  return admin ? `Hide ${nom}` : `Get ${nom}`
}
