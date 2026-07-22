<script setup lang="ts">
import { parcours } from '~/content'
</script>

<template>
  <BaseSection id="parcours" eyebrow="parcours" title="Formation & expérience">
    <ol class="timeline">
      <li v-for="etape in parcours" :key="etape.titre" class="timeline__item">
        <div class="timeline__dot" aria-hidden="true" />
        <p class="timeline__period">{{ etape.periode }}</p>
        <div class="card timeline__card">
          <h3>{{ etape.titre }}</h3>
          <p class="timeline__place">{{ etape.lieu }}</p>
          <p class="timeline__desc">{{ etape.description }}</p>
        </div>
      </li>
    </ol>
  </BaseSection>
</template>

<style scoped>
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--accent-soft);
}
.timeline__item {
  position: relative;
  padding-left: 2.2rem;
  margin-bottom: 1.8rem;
}
.timeline__dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--accent);
}
.timeline__period {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-bright);
  margin: 0 0 0.4rem;
}
.timeline__card { padding: 1.1rem 1.3rem; }
.timeline__card h3 { font-size: 1.05rem; }
.timeline__place {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0.2rem 0 0.5rem;
}
.timeline__desc { color: var(--muted); font-size: 0.93rem; margin: 0; }
</style>
