// @vitest-environment nuxt
// Contrôle d'accessibilité automatisé sur les composants montés.
//
// Le site est soigné à la main — libellés `sr-only`, `aria-label`, régions
// nommées, cibles de 44 px — mais rien n'empêchait ce soin de régresser. axe
// verrouille l'acquis structurel.
//
// Ce qu'axe ne voit pas ici : happy-dom ne calcule ni disposition ni couleurs
// effectives, donc contraste et taille des cibles lui échappent. Les règles
// correspondantes sont désactivées explicitement plutôt que laissées à
// produire un faux vert.

import axe from 'axe-core'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { profil, projets } from '~/content'
import ProjetCard from '~/components/sections/ProjetCard.vue'
import ProjetDetail from '~/components/sections/ProjetDetail.vue'
import PaletteCommandes from '~/components/layout/PaletteCommandes.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import SiteFooter from '~/components/layout/SiteFooter.vue'

/** Règles qu'un composant monté seul ne peut pas satisfaire honnêtement. */
const REGLES_ECARTEES: Record<string, { enabled: boolean }> = {
  // happy-dom ne calcule ni couleurs effectives ni disposition : ces deux
  // règles rendraient un vert qui ne prouve rien. Contrastes et cibles
  // tactiles se vérifient dans un vrai navigateur.
  'color-contrast': { enabled: false },
  'target-size': { enabled: false },
  // Règle de page : elle exige que tout contenu soit dans un repère
  // (`<main>`, `<nav>`…). Un composant monté seul n'en a par construction
  // aucun autour de lui. La page complète en compte neuf.
  'region': { enabled: false },
}

/** Lance axe sur un élément et renvoie les infractions lisibles. */
async function auditer(element: Element) {
  const resultat = await axe.run(element, {
    rules: REGLES_ECARTEES,
    // Le périmètre WCAG 2.1 AA, plus les bonnes pratiques structurelles.
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
  })
  return resultat.violations.map(v => `${v.id} — ${v.help} (${v.nodes.length} élément·s)`)
}

// Nettoyage inconditionnel : une assertion qui échoue saute le `unmount()`
// et laisse la fenêtre dans le document, où elle fausse l'audit suivant.
afterEach(() => {
  usePalette().fermer()
  document.body.innerHTML = ''
})

describe('accessibilité des composants', () => {
  it('carte projet', async () => {
    const carte = mount(ProjetCard, {
      props: { projet: projets[0]! },
      attachTo: document.body,
    })
    expect(await auditer(carte.element.parentElement!)).toEqual([])
  })

  it('fiche projet ouverte', async () => {
    const fiche = mount(ProjetDetail, {
      props: { projet: projets.find(p => p.details?.length) ?? projets[0]! },
      attachTo: document.body,
    })
    await fiche.vm.$nextTick()
    expect(await auditer(fiche.element)).toEqual([])
  })

  it('palette de commandes ouverte', async () => {
    const palette = mount(PaletteCommandes, { attachTo: document.body })
    usePalette().ouvrir()
    await palette.vm.$nextTick()
    await palette.vm.$nextTick()

    expect(await auditer(palette.element)).toEqual([])
  })

  it('interrupteur de thème', async () => {
    const bouton = mount(ThemeToggle, { attachTo: document.body })
    expect(await auditer(bouton.element.parentElement!)).toEqual([])
  })

  it('pied de page', async () => {
    const pied = mount(SiteFooter, { attachTo: document.body })
    expect(await auditer(pied.element)).toEqual([])
  })
})

describe('garde-fous du contenu', () => {
  it('donne un texte de remplacement à chaque capture', () => {
    // Sans alt, la capture n'existe pas pour une partie des visiteurs.
    const sansAlt = projets.flatMap(p => p.images ?? []).filter(i => !i.alt?.trim())
    expect(sansAlt).toEqual([])
  })

  it('n\'annonce que des liens absolus vers l\'extérieur', () => {
    // Un lien relatif casserait sous le baseURL /portfolio/.
    const liens = projets.flatMap(p => p.liens ?? [])
    expect(liens.filter(l => !/^https?:\/\//.test(l.url))).toEqual([])
  })

  it('donne un libellé distinct à chaque lien d\'un même projet', () => {
    // Deux liens « Voir » dans une même carte sont indiscernables à l'oreille.
    for (const projet of projets) {
      const labels = (projet.liens ?? []).map(l => l.label)
      expect(new Set(labels).size, projet.titre).toBe(labels.length)
    }
  })

  it('expose des coordonnées exploitables', () => {
    expect(profil.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
    expect(profil.github).toMatch(/^https:\/\/github\.com\//)
    expect(profil.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com\//)
  })
})
