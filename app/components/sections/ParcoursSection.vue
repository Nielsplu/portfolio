<script setup lang="ts">
import { parcours } from '~/content'
</script>

<template>
  <BaseSection id="parcours" eyebrow="parcours" title="Formation & expérience">
    <ol class="timeline">
      <li
        v-for="(etape, i) in parcours"
        :key="etape.titre"
        v-reveal="i * 70"
        class="reveal timeline__item"
        :class="{ 'timeline__item--encours': etape.enCours }"
      >
        <div class="timeline__dot" aria-hidden="true" />
        <p class="timeline__period">
          {{ etape.periode }}
          <!-- « 2024 – 2027 » se lit comme une période révolue : ce marqueur
               dit qu'elle court toujours. Le texte porte l'information, la
               pastille n'est qu'un rappel visuel. -->
          <span v-if="etape.enCours" class="timeline__encours">en cours</span>
        </p>
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
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--accent-bright);
  margin: 0 0 0.4rem;
}
.timeline__encours {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--txt-2xs);
  font-weight: 600;
  letter-spacing: 0.02em;
}
/* La pastille de l'étape en cours est pleine, les autres restent creuses :
   l'œil trouve le présent sans avoir à lire les dates. */
.timeline__item--encours .timeline__dot {
  background: var(--accent);
}
.timeline__card { padding: 1.1rem 1.3rem; }
.timeline__card h3 { font-size: var(--txt-lg); }
.timeline__place {
  color: var(--accent);
  font-weight: 600;
  font-size: var(--txt-sm);
  margin: 0.2rem 0 0.5rem;
}
.timeline__desc { color: var(--muted); font-size: var(--txt-md); margin: 0; }
</style>
