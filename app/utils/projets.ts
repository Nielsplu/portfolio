// Utilitaire générique et testable, indépendant du composant : facilite l'ajout
// d'autres filtres par catégorie ailleurs sur le site sans dupliquer la logique.
export function filtrerParCategorie<T extends { categorie: string }>(
  items: T[],
  categorie: string,
): T[] {
  return categorie === 'Tous' ? items : items.filter(item => item.categorie === categorie)
}
