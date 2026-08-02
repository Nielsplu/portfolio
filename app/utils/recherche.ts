// Filtre approximatif de la palette de commandes : « prj » doit trouver
// « Projets », « comp » « Compétences », sans exiger la frappe exacte ni les
// accents. Module pur, sans dépendance au DOM.

/** Minuscules sans accents : « Compétences » et « competences » se valent. */
function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const SEPARATEURS = new Set([' ', '-', '_', '/', '.', '(', '·', '—', ','])

/**
 * Proportion minimale de lettres retenues dans l'intervalle qu'elles couvrent.
 * Sans ce garde-fou, une simple sous-séquence suffit : « prisma » se retrouvait
 * dans « Copier l'adresse e-mail » et « cv » dans la moitié des projets.
 * Une seule lettre échappe à la règle, n'ayant aucune étendue à couvrir.
 */
const DENSITE_MINIMALE = 0.34
const LONGUEUR_SANS_GARDE = 2

export interface Correspondance {
  /** Plus le score est élevé, plus la commande remonte dans la liste. */
  score: number
  /** Index des caractères retenus, pour les mettre en évidence. */
  positions: number[]
}

/** Meilleure sous-séquence de `mot` dans `cible` à partir de `depart`. */
function depuis(cible: string, mot: string, depart: number): Correspondance | null {
  const positions: number[] = []
  let score = 0
  let curseur = depart
  let precedent = -2

  for (const lettre of mot) {
    const index = cible.indexOf(lettre, curseur)
    if (index === -1) return null

    score += 1
    if (index === precedent + 1) score += 8
    if (index === 0 || SEPARATEURS.has(cible[index - 1]!)) score += 6
    // Chaque caractère sauté éloigne un peu la correspondance, sans jamais
    // pouvoir rendre le score négatif : un match reste toujours un match.
    score -= Math.min(index - curseur, 3)

    positions.push(index)
    precedent = index
    curseur = index + 1
  }

  if (mot.length >= LONGUEUR_SANS_GARDE) {
    const etendue = positions[positions.length - 1]! - positions[0]! + 1
    if (mot.length / etendue < DENSITE_MINIMALE) return null
  }
  return { score, positions }
}

/**
 * Cherche un mot, en essayant chaque départ possible : un balayage glouton
 * depuis la gauche retiendrait la première lettre venue et manquerait la
 * vraie occurrence plus loin — « go » dans « Serveur et client FTP en Go ».
 */
function chercherMot(cible: string, mot: string): Correspondance | null {
  let meilleur: Correspondance | null = null
  for (let debut = 0; debut < cible.length; debut++) {
    if (cible[debut] !== mot[0]) continue
    const essai = depuis(cible, mot, debut)
    if (essai && (!meilleur || essai.score > meilleur.score)) meilleur = essai
  }
  return meilleur
}

/**
 * Chaque mot de la requête doit se retrouver dans le texte, mais pas
 * nécessairement au même endroit : « demo ftp » trouve « Lancer la démo —
 * Serveur et client FTP en Go ».
 *
 * @example
 * correspond('Serveur et client FTP en Go', 'ftp')?.score
 */
export function correspond(texte: string, requete: string): Correspondance | null {
  const cible = normaliser(texte)
  const mots = normaliser(requete).split(/\s+/).filter(Boolean)
  if (mots.length === 0) return { score: 0, positions: [] }

  const positions = new Set<number>()
  let score = 0

  for (const mot of mots) {
    const trouve = chercherMot(cible, mot)
    if (!trouve) return null
    score += trouve.score
    for (const p of trouve.positions) positions.add(p)
  }

  // Un libellé court qui contient toute la requête est plus pertinent qu'un
  // libellé long où elle se perd.
  score += Math.max(0, 12 - cible.length / 4)
  return { score, positions: [...positions].sort((a, b) => a - b) }
}

/**
 * Classe les entrées par pertinence décroissante, en écartant celles qui ne
 * correspondent pas. À score égal l'ordre d'origine est conservé, pour que la
 * liste ne s'agite pas d'une frappe à l'autre.
 */
export function filtrerParPertinence<T>(
  entrees: readonly T[],
  requete: string,
  libelle: (entree: T) => string,
): Array<{ entree: T, correspondance: Correspondance }> {
  return entrees
    .map((entree, rang) => ({ entree, rang, correspondance: correspond(libelle(entree), requete) }))
    .filter((r): r is typeof r & { correspondance: Correspondance } => r.correspondance !== null)
    .sort((a, b) => b.correspondance.score - a.correspondance.score || a.rang - b.rang)
    .map(({ entree, correspondance }) => ({ entree, correspondance }))
}
