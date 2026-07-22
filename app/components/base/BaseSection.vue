<script setup lang="ts">
// Coquille commune à toutes les sections : l'ancre, le conteneur centré,
// l'eyebrow et le titre. Le corps passe par le slot par défaut. Centraliser
// cet échafaudage garantit que toute nouvelle section est cohérente d'office.
defineProps<{
  id: string
  eyebrow: string
  title: string
}>()
</script>

<template>
  <section :id="id" class="section">
    <div class="container">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2 class="section-title">{{ title }}</h2>
      <slot />
    </div>
  </section>
</template>
