<script setup lang="ts">
import type { Projet } from '~/types/content'

defineProps<{
  projet: Projet
  /** La section le pose sur la seule carte qui se déplie en fiche. */
  morphe?: boolean
}>()
// Démo et fiche sont montées par la section parente (voir ProjetsSection).
defineEmits<{ 'ouvrir-demo': [], 'ouvrir-detail': [] }>()
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
    <ProjetActions
      :projet="projet"
      variante="carte"
      @ouvrir-demo="$emit('ouvrir-demo')"
      @ouvrir-detail="$emit('ouvrir-detail')"
    />
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
.project:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

/* Carte entièrement cliquable : on attend de pouvoir taper n'importe où, pas
   seulement sur un petit bouton — au pouce surtout.
   Le bouton « En savoir plus » projette un calque sur toute la carte plutôt que
   d'envelopper celle-ci dans un élément interactif : imbriquer les liens de
   projet et le bouton de démo dans un autre bouton serait invalide, et les
   rendrait inatteignables au clavier.
   Le calque est ancré ici et non dans ProjetActions : `inset: 0` se mesure sur
   le premier ancêtre positionné, c'est-à-dire la carte. */
.project:has(:deep(.actions__item--detail)) { cursor: pointer; }

:deep(.actions__item--detail)::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Les autres actions repassent au-dessus du calque, sinon le clic sur « Code »
   ouvrirait la fiche au lieu du dépôt. */
:deep(.actions__item:not(.actions__item--detail)),
:deep(.tech--lien) {
  position: relative;
  z-index: 2;
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
</style>
