<script setup lang="ts">
import type { ItemCompetence } from '~/types/content'
import { normaliserItem } from '~/types/content'

// Liste de technos avec logos (Simple Icons) et repli texte pour celles sans
// logo. Utilisée pour les tags de projet ; le style .tech vit dans TechBadge.
const props = withDefaults(defineProps<{
  items: ItemCompetence[]
  /** Nom de la liste pour les lecteurs d'écran. Sans lui, la navigation par
   *  listes annonce « liste de 8 éléments » sans dire de quoi il s'agit — et
   *  une page de projets en aligne une dizaine. */
  label?: string
}>(), { label: 'Technologies' })

// Les entrées arrivent sous deux formes (chaîne simple ou objet avec
// justificatif) : on les ramène à une seule ici, pour que le gabarit reste
// lisible et que TechBadge n'ait pas à connaître les deux.
const entrees = computed(() => props.items.map(normaliserItem))
</script>

<template>
  <ul class="tech-list" :aria-label="label">
    <TechBadge
      v-for="item in entrees"
      :key="item.label"
      :label="item.label"
      :justificatif="item.justificatif"
    />
  </ul>
</template>

<style scoped>
.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
