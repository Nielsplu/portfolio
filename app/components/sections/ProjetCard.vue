<script setup lang="ts">
import type { Projet } from '~/types/content'

defineProps<{ projet: Projet }>()
// Émis quand le visiteur lance la démo embarquée : la section parente monte
// le composant de démo correspondant (voir ProjetsSection).
defineEmits<{ 'ouvrir-demo': [] }>()
</script>

<template>
  <!-- `reveal` porté ici et non injecté par la directive : voir plugins/reveal.ts
       (la classe doit venir du template pour ne pas fausser l'hydratation). -->
  <article class="reveal card project">
    <p class="project__kind">{{ projet.sousTitre }}</p>
    <h3 class="project__title">{{ projet.titre }}</h3>
    <p class="project__desc">{{ projet.description }}</p>
    <TechList :items="projet.tags" :label="`Technologies du projet ${projet.titre}`" />
    <div v-if="projet.liens?.length || projet.demo || projet.codePrive" class="project__links">
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
  color: var(--on-accent);
}
.project__link--demo {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  cursor: pointer;
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
