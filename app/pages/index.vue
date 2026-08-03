<script setup lang="ts">
import { sections } from '~/sections/registry'
</script>

<template>
  <!-- `tabindex="-1"` : sans lui, le lien d'évitement déplace la vue mais pas
       le focus, et le Tab suivant repart dans la navigation qu'on venait
       justement de sauter. Non focalisable au Tab, seulement par programme. -->
  <main tabindex="-1">
    <component :is="s.component" v-for="s in sections" :key="s.id" />
  </main>
</template>
