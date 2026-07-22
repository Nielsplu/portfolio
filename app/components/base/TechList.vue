<script setup lang="ts">
// Liste de technos avec logos (Simple Icons) et repli texte pour celles sans
// logo. Utilisée pour les tags de projet ; le style .tech vit dans TechBadge.
defineProps<{ items: string[] }>()
</script>

<template>
  <ul class="tech-list">
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
