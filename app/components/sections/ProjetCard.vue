<script setup lang="ts">
import type { Projet } from '~/types/content'

const props = defineProps<{
  projet: Projet
  /** La section le pose sur la seule carte qui se déplie en fiche. */
  morphe?: boolean
}>()
// Démo et fiche sont montées par la section parente (voir ProjetsSection).
defineEmits<{ 'ouvrir-demo': [], 'ouvrir-detail': [] }>()

// Pas de bouton sans matière à montrer : il promettrait une fenêtre vide.
const aDuDetail = computed(() =>
  Boolean(props.projet.details?.length || props.projet.images?.length),
)
</script>

<template>
  <!-- `reveal` dans le template et non injecté : voir plugins/reveal.ts. -->
  <!-- Classe et non `:style` : la directive `v-reveal` écrit dans l'attribut
       `style` au rendu serveur, qu'une liaison réactive écraserait — les
       délais d'apparition en cascade disparaissaient à l'hydratation. -->
  <article class="reveal card project" :class="{ 'project--morphe': morphe }">
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
        <!-- Sans ce suffixe, six boutons porteraient le même nom. -->
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
      <!-- Une carte sans aucune action laisse penser à un oubli. -->
      <span v-if="projet.codePrive" class="project__prive">Code privé</span>
    </div>
  </article>
</template>

<style scoped>
/* Relie la carte à la fiche pendant la transition de vue. Le nom doit rester
   unique dans la page : la section ne le pose que sur une carte à la fois, et
   seulement tant que la fiche est fermée. */
.project--morphe { view-transition-name: fiche-projet; }

.project {
  position: relative;
  padding: var(--esp-6) var(--esp-6);
  display: flex;
  flex-direction: column;
  transition: transform var(--duree-rapide) var(--courbe), box-shadow var(--duree-rapide) var(--courbe);
}

/* Carte entièrement cliquable : on attend de pouvoir taper n'importe où, pas
   seulement sur un petit bouton — au pouce surtout.
   Le bouton « En savoir plus » projette un calque sur toute la carte plutôt que
   d'envelopper celle-ci dans un élément interactif : imbriquer les liens de
   projet et le bouton de démo dans un autre bouton serait invalide, et les
   rendrait inatteignables au clavier. */
.project:has(.project__link--detail) { cursor: pointer; }

.project__link--detail::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Les autres actions repassent au-dessus du calque, sinon le clic sur « Code »
   ouvrirait la fiche au lieu du dépôt. */
.project__link:not(.project__link--detail),
.project__prive,
:deep(.tech--lien) {
  position: relative;
  z-index: 2;
}
.project:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}
.project__kind {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 var(--esp-2);
}
.project__title { font-size: var(--txt-lg); margin-bottom: var(--esp-3); }
.project__desc {
  color: var(--muted);
  font-size: var(--txt-md);
  margin: 0 0 var(--esp-4);
  flex: 1;
}
.project__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--esp-3);
  margin-top: var(--esp-4);
}
.project__link {
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
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
/* Bordée mais non remplie : ne concurrence pas le bouton de démo.
   Le fond doit être déclaré : sans lui, ce <button> prenait celui du
   navigateur — gris pâle en thème clair, gris moyen bien visible en sombre,
   avec 1,99 de contraste sous le libellé. */
.project__link--detail {
  background: transparent;
  border-color: var(--accent);
  cursor: pointer;
  font-family: var(--font-mono);
}
/* Inerte : tirets pour le distinguer d'un lien au premier coup d'œil. */
.project__prive {
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--muted);
}
.project__link--demo:hover { background: var(--accent-bright); }
</style>
