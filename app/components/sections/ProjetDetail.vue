<script setup lang="ts">
import type { Projet } from '~/types/content'

// Fenêtre de détail d'un projet.
//
// Un <dialog> ouvert par showModal() plutôt qu'une div stylée : le navigateur
// fournit alors gratuitement le piégeage du focus, la fermeture par Échap et
// l'inertie de l'arrière-plan — trois choses qu'une réimplémentation manuelle
// rate presque toujours. Même parti pris que la démo FTP, par cohérence.
const props = defineProps<{ projet: Projet | null }>()
const emit = defineEmits<{ fermer: [] }>()

const dialogue = ref<HTMLDialogElement>()
const corps = ref<HTMLElement>()
const { verrouiller } = useVerrouDefilement()
const idTitre = useId()

watch(() => props.projet, async (projet) => {
  if (projet) {
    dialogue.value?.showModal()
    verrouiller(true)
    await nextTick()
    // Le contenu peut être long : on repart du haut à chaque ouverture, sinon
    // la fenêtre garde la position de défilement du projet précédent.
    corps.value?.scrollTo({ top: 0 })
  }
  else {
    dialogue.value?.close()
    verrouiller(false)
  }
})
</script>

<template>
  <dialog
    ref="dialogue"
    class="fiche"
    :aria-labelledby="idTitre"
    @close="emit('fermer')"
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

      <!-- Galerie : une capture prouve mieux qu'un paragraphe qu'une chose
           existe. Absente, la section entière disparaît plutôt que de laisser
           un cadre vide. -->
      <section v-if="projet.images?.length" class="galerie" aria-label="Captures du projet">
        <figure v-for="img in projet.images" :key="img.src" class="galerie__item">
          <!-- `loading="lazy"` : la fenêtre n'est montée qu'à l'ouverture, mais
               une galerie longue ne doit pas tout télécharger d'un coup. -->
          <img :src="img.src" :alt="img.alt" class="galerie__image" loading="lazy">
          <figcaption v-if="img.legende" class="galerie__legende">{{ img.legende }}</figcaption>
        </figure>
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
  background: rgb(0 0 0 / 0.55);
  backdrop-filter: blur(3px);
}
.fiche__corps {
  max-height: inherit;
  overflow-y: auto;
  padding: clamp(1.4rem, 4vw, 2.2rem);
}
.fiche__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.fiche__categorie {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 0.35rem;
}
.fiche__titre {
  font-size: var(--txt-xl);
  margin: 0;
}
.fiche__fermer {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  /* 40 px : au-dessus du minimum recommandé pour une cible tactile. */
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
  margin: 0 0 1.6rem;
  max-width: 68ch;
}
.fiche__bloc { margin-bottom: 1.6rem; }
.fiche__soustitre {
  font-size: var(--txt-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 0 0 0.7rem;
}
.fiche__liste {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--ink);
  font-size: var(--txt-md);
  line-height: 1.6;
}
.fiche__liste li { margin-bottom: 0.4rem; }
.fiche__liste li::marker { color: var(--accent); }
.fiche__actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 0.4rem;
}
.fiche__prive {
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.9rem;
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--muted);
}

/* ---- Galerie ---- */
.galerie {
  display: grid;
  /* Une seule colonne tant que la place manque : une capture d'interface
     illisible ne prouve rien. */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.6rem;
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
  margin-top: 0.4rem;
  font-size: var(--txt-xs);
  color: var(--muted);
}
</style>
