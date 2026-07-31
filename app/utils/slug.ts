/**
 * Transforme un titre en identifiant d'URL : minuscules, sans accents,
 * séparateurs réduits à un tiret unique.
 *
 * Dérivé du titre plutôt que saisi dans le contenu — un slug oublié casserait
 * un lien en silence.
 *
 * @example
 * versSlug('Infrastructure réseau sécurisée') // 'infrastructure-reseau-securisee'
 */
export function versSlug(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
