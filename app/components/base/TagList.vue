<script setup lang="ts">
// Liste de jetons mono (technos, mots-clés). Le style .tag est global
// (design system) ; ce composant n'apporte que la disposition en ligne.
defineProps<{ items: string[] }>()
</script>

<template>
  <ul class="tag-list">
    <li v-for="item in items" :key="item" class="tag">{{ item }}</li>
  </ul>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
