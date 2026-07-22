<script setup lang="ts">
import { sections } from '~/sections/registry'
</script>

<template>
  <main>
    <component :is="s.component" v-for="s in sections" :key="s.id" />
  </main>
</template>
