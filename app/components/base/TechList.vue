<script setup lang="ts">
// Liste de technos avec logos (Simple Icons) et repli texte pour celles sans
// logo. Utilisée pour les tags de projet ; le style .tech vit dans TechBadge.
withDefaults(defineProps<{
  items: string[]
  /** Nom de la liste pour les lecteurs d'écran. Sans lui, la navigation par
   *  listes annonce « liste de 8 éléments » sans dire de quoi il s'agit — et
   *  une page de projets en aligne une dizaine. */
  label?: string
}>(), { label: 'Technologies' })
</script>

<template>
  <ul class="tech-list" :aria-label="label">
    <TechBadge v-for="item in items" :key="item" :label="item" />
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
