<script setup lang="ts">
import { categoriesProjet, projets } from '~/data/portfolio'

const filtres = ['Tous', ...categoriesProjet] as const
const actif = ref<(typeof filtres)[number]>('Tous')

const visibles = computed(() => filtrerParCategorie(projets, actif.value))
</script>

<template>
  <section id="projets" class="section">
    <div class="container">
      <p class="eyebrow">projets</p>
      <h2 class="section-title">Projets réalisés</h2>

      <div class="filters" role="group" aria-label="Filtrer les projets">
        <button
          v-for="f in filtres"
          :key="f"
          class="filters__btn"
          :class="{ 'filters__btn--active': actif === f }"
          :aria-pressed="actif === f"
          @click="actif = f"
        >
          {{ f }}
        </button>
      </div>

      <div class="grid">
        <article v-for="p in visibles" :key="p.titre" class="card project">
          <p class="project__kind">{{ p.sousTitre }}</p>
          <h3 class="project__title">{{ p.titre }}</h3>
          <p class="project__desc">{{ p.description }}</p>
          <ul class="project__tags">
            <li v-for="t in p.tags" :key="t" class="tag">{{ t }}</li>
          </ul>
          <div v-if="p.liens?.length" class="project__links">
            <a
              v-for="l in p.liens"
              :key="l.url"
              class="project__link"
              :href="l.url"
              target="_blank"
              rel="noopener"
            >{{ l.label }} ↗</a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.8rem;
}
.filters__btn {
  border: 1.5px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  border-radius: var(--radius-sm);
  padding: 0.45rem 1.05rem;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.filters__btn:hover { border-color: var(--accent-bright); color: var(--accent); }
.filters__btn--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.4rem;
}
.project {
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.project:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}
.project__kind {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 0.4rem;
}
.project__title { font-size: 1.12rem; margin-bottom: 0.6rem; }
.project__desc {
  color: var(--muted);
  font-size: 0.92rem;
  margin: 0 0 1rem;
  flex: 1;
}
.project__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.project__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}
.project__link {
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  transition: all 0.15s ease;
}
.project__link:hover {
  border-color: var(--accent-bright);
  background: var(--accent);
  color: #fff;
}
</style>
