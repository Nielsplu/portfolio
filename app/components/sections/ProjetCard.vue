<script setup lang="ts">
import type { Projet } from '~/types/content'

const props = defineProps<{ projet: Projet }>()
// La démo et la fiche détaillée sont toutes deux montées par la section
// parente : une seule fenêtre à la fois, et le composant lourd n'est chargé
// qu'à l'ouverture (voir ProjetsSection).
defineEmits<{ 'ouvrir-demo': [], 'ouvrir-detail': [] }>()

// La fiche ne s'ouvre que s'il y a matière à montrer — des points de détail ou
// des captures. Sans cela, le bouton promettrait une fenêtre vide.
const aDuDetail = computed(() =>
  Boolean(props.projet.details?.length || props.projet.images?.length),
)
</script>

<template>
  <!-- `reveal` porté ici et non injecté par la directive : voir plugins/reveal.ts
       (la classe doit venir du template pour ne pas fausser l'hydratation). -->
  <article class="reveal card project">
    <p class="project__kind">{{ projet.sousTitre }}</p>
    <h3 class="project__title">{{ projet.titre }}</h3>
    <p class="project__desc">{{ projet.description }}</p>

    <TechList :items="projet.tags" :label="`Technologies du projet ${projet.titre}`" />
    <div v-if="aDuDetail || projet.liens?.length || projet.demo || projet.codePrive" class="project__links">
      <button
        v-if="aDuDetail"
        class="project__link project__link--detail"
        type="button"
        @click="$emit('ouvrir-detail')"
      >
        En savoir plus
        <!-- Suffixe masqué : sans lui, une page qui aligne plusieurs cartes
             présente autant de boutons au nom identique. -->
        <span class="sr-only">— {{ projet.titre }}</span>
      </button>
      <button
        v-if="projet.demo"
        class="project__link project__link--demo"
        @click="$emit('ouvrir-demo')"
      >▶ Tester ici</button>
      <a
        v-for="lien in projet.liens"
        :key="lien.url"
        class="project__link"
        :href="lien.url"
        target="_blank"
        rel="noopener"
      >{{ lien.label }} <span aria-hidden="true">↗</span><span class="sr-only">(nouvel onglet)</span></a>
      <!-- Mention plutôt qu'absence de lien : une carte sans aucune action
           laisse penser à un oubli. -->
      <span v-if="projet.codePrive" class="project__prive">Code privé</span>
    </div>
  </article>
</template>

<style scoped>
.project {
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform var(--duree-rapide) var(--courbe), box-shadow var(--duree-rapide) var(--courbe);
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
  transition: all var(--duree-rapide) var(--courbe);
}
.project__link:hover {
  border-color: var(--accent-bright);
  background: var(--accent);
  color: var(--on-accent);
}
.project__link--demo {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  cursor: pointer;
}
/* Action de lecture, pas de sortie : bordée d'accent mais non remplie, elle se
   distingue des liens externes sans concurrencer le bouton de démo. */
.project__link--detail {
  border-color: var(--accent);
  cursor: pointer;
  font-family: var(--font-mono);
}
/* Volontairement inerte : ce n'est pas une action, seulement une explication.
   Bordure en tirets pour le distinguer d'un lien au premier coup d'œil. */
.project__prive {
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--muted);
}
.project__link--demo:hover { background: var(--accent-bright); }
</style>
