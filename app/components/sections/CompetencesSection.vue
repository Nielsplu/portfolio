<script setup lang="ts">
import { competences } from '~/content'
</script>

<template>
  <BaseSection id="competences" eyebrow="competences" title="Compétences & outils">
    <div class="grid">
      <div v-for="(c, i) in competences" :key="c.titre" class="card skill">
        <h3 class="skill__title">
          <span class="skill__index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ c.titre }}
        </h3>
        <div v-for="g in c.groupes" :key="g.label" class="skill__group">
          <p class="skill__label">{{ g.label }}</p>
          <TagList :items="g.items" />
        </div>
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.4rem;
}
.skill { padding: 1.4rem 1.5rem; }
.skill__title {
  font-size: 1.05rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.skill__index {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent-bright);
}
.skill__group { margin-bottom: 0.9rem; }
.skill__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.45rem;
}
</style>
