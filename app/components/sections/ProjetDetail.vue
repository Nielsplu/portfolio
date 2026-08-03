<script setup lang="ts">
import type { Projet } from '~/types/content'
import { schemas } from '~/schemas'

// <dialog> + showModal() plutôt qu'une div stylée : le navigateur fournit le
// piégeage du focus, la fermeture par Échap et l'inertie de l'arrière-plan.
const props = defineProps<{ projet: Projet | null }>()
const emit = defineEmits<{ fermer: [] }>()

const corps = ref<HTMLElement>()
const idTitre = useId()

const { dialogue, attributs } = useModale({
  ouverte: () => props.projet !== null,
  fermer: () => emit('fermer'),
  // Sinon la fiche garde la position de défilement du projet précédent.
  surOuverture: () => corps.value?.scrollTo({ top: 0 }),
})
</script>

<template>
  <dialog
    ref="dialogue"
    class="fiche"
    :aria-labelledby="idTitre"
    v-bind="attributs"
  >
    <div v-if="projet" ref="corps" class="fiche__corps">
      <header class="fiche__entete">
        <div>
          <p class="fiche__categorie">{{ projet.sousTitre }}</p>
          <h2 :id="idTitre" class="fiche__titre">{{ projet.titre }}</h2>
        </div>
        <button class="fiche__fermer" type="button" aria-label="Fermer" @click="emit('fermer')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <p class="fiche__resume">{{ projet.description }}</p>

      <!-- Absente, la section disparaît plutôt que de laisser un cadre vide. -->
      <section v-if="projet.images?.length" class="galerie" aria-label="Captures du projet">
        <figure v-for="img in projet.images" :key="img.src" class="galerie__item">
          <!-- Une galerie longue ne doit pas tout télécharger d'un coup. -->
          <img :src="img.src" :alt="img.alt" class="galerie__image" loading="lazy">
          <figcaption v-if="img.legende" class="galerie__legende">{{ img.legende }}</figcaption>
        </figure>
      </section>

      <!-- Schéma technique : chargé à l'ouverture, jamais dans le bundle
           initial (voir le registre app/schemas). -->
      <section v-if="projet.schema" class="fiche__bloc">
        <h3 class="fiche__soustitre">Architecture</h3>
        <component :is="schemas[projet.schema]" />
      </section>

      <section v-if="projet.details?.length" class="fiche__bloc">
        <h3 class="fiche__soustitre">Ce que contient le projet</h3>
        <ul class="fiche__liste">
          <li v-for="point in projet.details" :key="point">{{ point }}</li>
        </ul>
      </section>

      <section class="fiche__bloc">
        <h3 class="fiche__soustitre">Technologies</h3>
        <TechList :items="projet.tags" :label="`Technologies du projet ${projet.titre}`" />
      </section>

      <footer v-if="projet.liens?.length || projet.codePrive" class="fiche__actions">
        <a
          v-for="lien in projet.liens"
          :key="lien.url"
          class="btn btn--primary"
          :href="lien.url"
          target="_blank"
          rel="noopener"
          :aria-label="`${lien.label} — ${projet.titre} (nouvel onglet)`"
        >{{ lien.label }} <span aria-hidden="true">↗</span></a>
        <span v-if="projet.codePrive" class="fiche__prive">Code privé</span>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.fiche {
  width: min(760px, calc(100vw - 2rem));
  max-height: min(86vh, 900px);
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
  overflow: hidden;
}
.fiche::backdrop {
  background: var(--voile);
  backdrop-filter: blur(3px);
}
/* Même nom que la carte d'origine : le navigateur déplie l'une en l'autre.
   Sans conflit d'unicité, la fiche n'étant dans le DOM que lorsque la carte a
   déjà rendu le nom. */
.fiche__corps {
  view-transition-name: fiche-projet;
  max-height: inherit;
  overflow-y: auto;
  padding: clamp(1.4rem, 4vw, 2.2rem);
}
.fiche__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--esp-4);
  margin-bottom: var(--esp-5);
}
.fiche__categorie {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 var(--esp-2);
}
.fiche__titre {
  font-size: var(--txt-xl);
  margin: 0;
}
.fiche__fermer {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  /* 40 px : au-dessus du minimum tactile recommandé. */
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color var(--duree-rapide) var(--courbe), border-color var(--duree-rapide) var(--courbe);
}
.fiche__fermer:hover {
  color: var(--accent);
  border-color: var(--accent-bright);
}
.fiche__fermer svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
}
.fiche__resume {
  color: var(--muted);
  margin: 0 0 var(--esp-6);
  max-width: 68ch;
}
.fiche__bloc { margin-bottom: var(--esp-6); }
.fiche__soustitre {
  font-size: var(--txt-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 0 0 var(--esp-3);
}
.fiche__liste {
  margin: 0;
  padding-left: var(--esp-5);
  color: var(--ink);
  font-size: var(--txt-md);
  line-height: 1.6;
}
.fiche__liste li { margin-bottom: var(--esp-2); }
.fiche__liste li::marker { color: var(--accent); }
.fiche__actions {
  display: flex;
  gap: var(--esp-3);
  flex-wrap: wrap;
  align-items: center;
  padding-top: var(--esp-2);
}
.fiche__prive {
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--muted);
}

/* ---- Galerie ---- */
.galerie {
  display: grid;
  /* Une seule colonne si la place manque : une capture illisible ne prouve rien. */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--esp-4);
  margin-bottom: var(--esp-6);
}
.galerie__item { margin: 0; }
.galerie__image {
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}
.galerie__legende {
  margin-top: var(--esp-2);
  font-size: var(--txt-xs);
  color: var(--muted);
}
</style>
