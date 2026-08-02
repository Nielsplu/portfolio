<script setup lang="ts">
import { techIcons } from '~/content/tech'

// Un seul <symbol> par logo, référencé ensuite par <use> depuis chaque badge.
//
// Les tracés étaient inlinés dans chaque badge : 57 occurrences sur la page
// pour 35 dessins distincts, soit 86 Ko de markup dont 39 Ko de pur doublon.
// Le registre associe d'ailleurs plusieurs libellés au même logo (« Nuxt 4 »
// et « Nuxt / Vue 3 »), et un même logo revient d'une carte projet à l'autre
// puis dans la section compétences.
const symboles = (() => {
  const parSlug = new Map<string, string>()
  for (const icone of Object.values(techIcons)) parSlug.set(icone.slug, icone.path)
  return [...parSlug].map(([slug, trace]) => ({ slug, trace }))
})()
</script>

<template>
  <svg class="tech-sprite" aria-hidden="true" focusable="false">
    <defs>
      <!-- Le viewBox vit sur le symbole : le <svg> du badge est dimensionné en
           CSS et laisse le symbole s'y adapter. -->
      <symbol v-for="{ slug, trace } in symboles" :id="`tech-${slug}`" :key="slug" viewBox="0 0 24 24">
        <path :d="trace" />
      </symbol>
    </defs>
  </svg>
</template>

<style scoped>
/* Sorti du flux plutôt que display:none : un arbre non rendu empêche certains
   moteurs de résoudre les <use> qui le référencent. */
.tech-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
