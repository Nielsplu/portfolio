import { describe, expect, it } from 'vitest'
import { couleurLisible, hexVersTsl } from './couleurs'

/** Extrait la luminosité d'une chaîne `hsl(t, s%, l%)`. */
function luminosite(hsl: string): number {
  return Number(hsl.match(/,\s*[\d.]+%,\s*([\d.]+)%/)![1])
}

/** Extrait la teinte d'une chaîne `hsl(t, s%, l%)`. */
function teinte(hsl: string): number {
  return Number(hsl.match(/hsl\((\d+)/)![1])
}

describe('hexVersTsl', () => {
  it('reconnaît le noir et le blanc comme non saturés', () => {
    expect(hexVersTsl('000000').saturation).toBe(0)
    expect(hexVersTsl('ffffff').saturation).toBe(0)
    expect(hexVersTsl('000000').luminosite).toBe(0)
    expect(hexVersTsl('ffffff').luminosite).toBe(100)
  })

  it('place le rouge pur sur la teinte 0 et le bleu pur sur 240', () => {
    expect(Math.round(hexVersTsl('ff0000').teinte)).toBe(0)
    expect(Math.round(hexVersTsl('0000ff').teinte)).toBe(240)
  })
})

describe('couleurLisible', () => {
  it('éclaircit une marque quasi noire pour le thème sombre', () => {
    // Next.js et Sphinx sont litteralement noirs : tels quels, ils
    // disparaissaient sur le fond sombre du site.
    expect(luminosite(couleurLisible('000000', 'sombre'))).toBeGreaterThanOrEqual(62)
  })

  it('assombrit une marque très claire pour le thème clair', () => {
    expect(luminosite(couleurLisible('ffffff', 'clair'))).toBeLessThanOrEqual(52)
  })

  it('laisse intacte une couleur déjà lisible', () => {
    // Bleu moyen : dans la plage sur les deux fonds, donc non corrigé.
    const tsl = hexVersTsl('3178c6')
    expect(luminosite(couleurLisible('3178c6', 'clair'))).toBe(Math.round(tsl.luminosite))
  })

  it('préserve la teinte de la marque en corrigeant la luminosité', () => {
    // Prisma, ardoise très sombre : eclairci pour le sombre, mais sa teinte
    // doit rester celle de la marque.
    const attendue = Math.round(hexVersTsl('2d3748').teinte)
    expect(teinte(couleurLisible('2d3748', 'sombre'))).toBe(attendue)
  })

  it('rend une valeur neutre pour une marque sans couleur', () => {
    // Inutile de maquiller un noir en gris teinté : la saturation reste nulle.
    expect(couleurLisible('000000', 'sombre')).toMatch(/hsl\(\d+,\s*0%/)
  })
})
