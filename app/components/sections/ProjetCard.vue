<script setup lang="ts">
import type { Projet } from '~/types/content'

const props = defineProps<{ projet: Projet }>()
// Émis quand le visiteur lance la démo embarquée : la section parente monte
// le composant de démo correspondant (voir ProjetsSection).
defineEmits<{ 'ouvrir-demo': [] }>()

// Dépliant de détails. Il vit dans la carte plutôt que sur une page dédiée :
// un visiteur intéressé n'a plus de cul-de-sac, sans qu'on ait à créer six
// pages dont la moitié seraient vides.
// `ouvert` vaut false au rendu serveur comme au premier rendu client, donc
// aucun écart d'hydratation. useId() garantit un identifiant stable entre les
// deux, indispensable pour relier le bouton à la région qu'il commande.
const ouvert = ref(false)
const idDetails = useId()
const aDesDetails = computed(() => Boolean(props.projet.details?.length))
</script>

<template>
  <!-- `reveal` porté ici et non injecté par la directive : voir plugins/reveal.ts
       (la classe doit venir du template pour ne pas fausser l'hydratation). -->
  <article class="reveal card project">
    <p class="project__kind">{{ projet.sousTitre }}</p>
    <h3 class="project__title">{{ projet.titre }}</h3>
    <p class="project__desc">{{ projet.description }}</p>

    <!-- Dépliant : présent seulement si le projet a des détails à montrer, pour
         ne pas promettre un contenu inexistant. -->
    <div v-if="aDesDetails" class="details">
      <button
        class="details__bouton"
        type="button"
        :aria-expanded="ouvert"
        :aria-controls="idDetails"
        @click="ouvert = !ouvert"
      >
        <span class="details__chevron" :class="{ 'details__chevron--ouvert': ouvert }" aria-hidden="true">›</span>
        {{ ouvert ? 'Masquer le détail' : 'En savoir plus' }}
        <!-- Suffixe masqué : sans lui, une page qui aligne plusieurs dépliants
             présente autant de boutons au nom identique. -->
        <span class="sr-only">— {{ projet.titre }}</span>
      </button>
      <!-- `v-show` et non `v-if` : le contenu reste dans le DOM, donc trouvable
           par la recherche du navigateur et indexable, même replié. -->
      <ul v-show="ouvert" :id="idDetails" class="details__liste">
        <li v-for="point in projet.details" :key="point">{{ point }}</li>
      </ul>
    </div>

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
/* ---- Dépliant de détails ---- */
.details { margin: 0 0 1rem; }
.details__bouton {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--duree-rapide) var(--courbe);
}
.details__bouton:hover { color: var(--accent-bright); }
.details__chevron {
  display: inline-block;
  font-size: 1.1em;
  line-height: 1;
  transition: transform var(--duree-moyenne) var(--courbe);
}
.details__chevron--ouvert { transform: rotate(90deg); }
.details__liste {
  margin: 0.7rem 0 0;
  padding: 0 0 0 1.1rem;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.55;
}
.details__liste li { margin-bottom: 0.35rem; }
.details__liste li::marker { color: var(--accent-bright); }

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
