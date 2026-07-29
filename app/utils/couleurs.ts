// Ajustement des couleurs de marque pour qu'elles restent lisibles sur les deux
// thèmes.
//
// Les teintes fournies par Simple Icons sont les couleurs officielles des
// marques, pensées pour un fond blanc. Plusieurs sont quasi noires — Next.js et
// Sphinx le sont littéralement, Prisma est un ardoise très foncé — et
// disparaîtraient sur le fond sombre du site. À l'inverse, quelques marques très
// claires deviennent illisibles sur fond blanc.
//
// On conserve donc la teinte et la saturation, qui portent l'identité de la
// marque, et on ne contraint que la luminosité dans une plage sûre.

/** Composantes teinte / saturation / luminosité, en degrés et pourcentages. */
interface Tsl {
  teinte: number
  saturation: number
  luminosite: number
}

/**
 * Convertit un hexadécimal à six chiffres (sans `#`) en TSL.
 *
 * @example
 * hexVersTsl('6ba3d6') // bleu clair → { teinte: 208, saturation: 57, luminosite: 63 }
 */
export function hexVersTsl(hex: string): Tsl {
  const n = Number.parseInt(hex, 16)
  const r = ((n >> 16) & 255) / 255
  const v = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255

  const max = Math.max(r, v, b)
  const min = Math.min(r, v, b)
  const delta = max - min
  const luminosite = (max + min) / 2

  if (delta === 0) return { teinte: 0, saturation: 0, luminosite: luminosite * 100 }

  const saturation = delta / (1 - Math.abs(2 * luminosite - 1))

  let teinte: number
  if (max === r) teinte = ((v - b) / delta) % 6
  else if (max === v) teinte = (b - r) / delta + 2
  else teinte = (r - v) / delta + 4

  teinte *= 60
  if (teinte < 0) teinte += 360

  return { teinte, saturation: saturation * 100, luminosite: luminosite * 100 }
}

/** Plage de luminosité tolérée sur fond clair : au-delà, la couleur se fond
 *  dans le blanc. */
const MAX_SUR_CLAIR = 52
/** Plage tolérée sur fond sombre : en deçà, la couleur disparaît dans le noir. */
const MIN_SUR_SOMBRE = 62

/**
 * Renvoie la couleur de marque ramenée dans une plage lisible sur le fond
 * demandé, au format `hsl(...)`. La teinte et la saturation sont préservées :
 * seule la luminosité est corrigée, et uniquement si nécessaire.
 *
 * Une marque achromatique (noir, blanc, gris) n'a pas de teinte à préserver :
 * on lui rend une valeur neutre plutôt qu'un gris coloré au hasard.
 *
 * @example
 * couleurLisible('000000', 'sombre') // Next.js, noir → 'hsl(0, 0%, 62%)'
 * couleurLisible('6ba3d6', 'clair')  // déjà lisible → luminosité inchangée
 */
export function couleurLisible(hex: string, fond: 'clair' | 'sombre'): string {
  const { teinte, saturation, luminosite } = hexVersTsl(hex)

  const corrigee = fond === 'sombre'
    ? Math.max(luminosite, MIN_SUR_SOMBRE)
    : Math.min(luminosite, MAX_SUR_CLAIR)

  // Une couleur sans saturation resterait grise quelle que soit la teinte :
  // inutile de la maquiller, on l'assume neutre.
  const s = saturation < 8 ? 0 : saturation

  return `hsl(${Math.round(teinte)}, ${Math.round(s)}%, ${Math.round(corrigee)}%)`
}
