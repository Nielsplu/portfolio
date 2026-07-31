// Ajustement des couleurs de marque pour les deux thèmes.
//
// Les teintes de Simple Icons sont pensées pour un fond blanc : Next.js et
// Sphinx sont noirs, Prisma quasi. On garde teinte et saturation — l'identité
// de la marque — et on ne contraint que la luminosité.

interface Tsl {
  teinte: number
  saturation: number
  luminosite: number
}

/**
 * Convertit un hexadécimal à six chiffres (sans `#`) en TSL.
 *
 * @example
 * hexVersTsl('6ba3d6') // { teinte: 208, saturation: 57, luminosite: 63 }
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

/** Au-delà, la couleur se fond dans le blanc. */
const MAX_SUR_CLAIR = 52
/** En deçà, elle disparaît dans le noir. */
const MIN_SUR_SOMBRE = 62

/**
 * Couleur de marque ramenée dans une plage lisible sur le fond demandé.
 * Seule la luminosité est corrigée, et uniquement si nécessaire.
 *
 * @example
 * couleurLisible('000000', 'sombre') // 'hsl(0, 0%, 62%)'
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
