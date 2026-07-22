<script setup lang="ts">
import type { DemoId } from '~/demos'
import { categoriesProjet, projets } from '~/content'
import { demos } from '~/demos'
import { filtrerParCategorie } from '~/utils/filtres'

const filtres = ['Tous', ...categoriesProjet] as const
const actif = ref<(typeof filtres)[number]>('Tous')
const visibles = computed(() => filtrerParCategorie(projets, actif.value))

// Démo active : son composant (async) n'est monté — et donc chargé — qu'à
// l'ouverture, et démonté à la fermeture.
const demoOuverte = ref<DemoId | null>(null)
</script>

<template>
  <BaseSection id="projets" eyebrow="projets" title="Projets réalisés">
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
      <ProjetCard
        v-for="(p, i) in visibles"
        :key="p.titre"
        v-reveal="i * 60"
        :projet="p"
        @ouvrir-demo="demoOuverte = p.demo ?? null"
      />
    </div>

    <component
      :is="demos[demoOuverte]"
      v-if="demoOuverte"
      :ouvert="true"
      @update:ouvert="(valeur: boolean) => { if (!valeur) demoOuverte = null }"
    />
  </BaseSection>
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
</style>
