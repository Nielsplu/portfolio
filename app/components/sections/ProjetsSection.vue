<script setup lang="ts">
import type { DemoId } from '~/demos'
import type { Projet } from '~/types/content'
import { categoriesProjet, projets } from '~/content'
import { demos } from '~/demos'
import { filtrerParCategorie } from '~/utils/filtres'
import { versSlug } from '~/utils/slug'

const filtres = ['Tous', ...categoriesProjet] as const
const actif = ref<(typeof filtres)[number]>('Tous')
const visibles = computed(() => filtrerParCategorie(projets, actif.value))

// Démo active : son composant (async) n'est monté — et donc chargé — qu'à
// l'ouverture, et démonté à la fermeture.
const demoOuverte = ref<DemoId | null>(null)

// Projet mis en avant pour sa démo. Dérivé du contenu et non codé en dur : le
// bandeau disparaît de lui-même si plus aucun projet n'expose de démo, et
// suivra le premier qui en déclarera une.
const projetDemo = computed(() => projets.find(p => p.demo && p.demoAccroche))

// Une seule fiche à la fois, gérée ici : sinon six instances coexisteraient
// dans le DOM.
const projetOuvert = ref<Projet | null>(null)

// Fiches et démos partageables par URL. Les préfixes évitent toute collision
// avec les ancres de section, qui sont de simples `#projets`.
const PREFIXE = '#projet/'
const PREFIXE_DEMO = '#demo/'

/** Projet désigné par l'adresse courante, s'il y en a un. */
function projetDepuisUrl(): Projet | null {
  if (import.meta.server) return null
  const hash = window.location.hash
  if (!hash.startsWith(PREFIXE)) return null
  const slug = hash.slice(PREFIXE.length)
  return projets.find(p => versSlug(p.titre) === slug) ?? null
}

/** Démo désignée par l'adresse courante, si elle existe au registre. */
function demoDepuisUrl(): DemoId | null {
  if (import.meta.server) return null
  const hash = window.location.hash
  if (!hash.startsWith(PREFIXE_DEMO)) return null
  const id = hash.slice(PREFIXE_DEMO.length)
  return id in demos ? id as DemoId : null
}

/** Aligne l'état sur l'adresse, au chargement comme au Précédent. */
function synchroniser() {
  projetOuvert.value = projetDepuisUrl()
  demoOuverte.value = demoDepuisUrl()
}

// Carte que la fenêtre doit prolonger visuellement. Un `view-transition-name`
// doit être unique dans la page à tout instant : la carte le porte tant que la
// fiche est fermée, la fenêtre le reprend dès qu'elle s'ouvre.
const carteMorphee = ref<string | null>(null)

/** Vrai pour la seule carte que la fiche doit prolonger, fiche encore fermée. */
function estMorphee(projet: Projet): boolean {
  return carteMorphee.value === projet.titre && !projetOuvert.value
}

async function ouvrirFiche(projet: Projet) {
  carteMorphee.value = projet.titre
  // La carte doit porter le nom avant que l'instantané « avant » soit pris.
  await nextTick()

  await transitionner(() => {
    // pushState et non le routeur, qui ferait défiler vers une ancre inexistante.
    history.pushState(null, '', PREFIXE + versSlug(projet.titre))
    projetOuvert.value = projet
  })
}

async function fermerFiche() {
  await transitionner(() => {
    projetOuvert.value = null
    // replaceState : Précédent ramène avant l'ouverture, sans traverser une
    // pile de fermetures.
    if (window.location.hash.startsWith(PREFIXE)) {
      history.replaceState(null, '', '#projets')
    }
  })
  carteMorphee.value = null
}

/**
 * Démo lancée depuis la fiche : on referme celle-ci d'abord. Deux fenêtres
 * modales empilées désorientent, et la seconde piégerait le focus de la
 * première.
 */
async function ouvrirDemoDepuisFiche() {
  const id = projetOuvert.value?.demo
  await fermerFiche()
  ouvrirDemo(id)
}

function ouvrirDemo(id: DemoId | undefined) {
  if (!id) return
  history.pushState(null, '', PREFIXE_DEMO + id)
  demoOuverte.value = id
}

function fermerDemo() {
  demoOuverte.value = null
  if (window.location.hash.startsWith(PREFIXE_DEMO)) {
    history.replaceState(null, '', '#projets')
  }
}

onMounted(() => {
  synchroniser()
  // Lien partagé : la section doit être à l'écran derrière la fenêtre.
  if (projetOuvert.value || demoOuverte.value) {
    document.getElementById('projets')?.scrollIntoView({ block: 'start' })
  }
  window.addEventListener('hashchange', synchroniser)
  onBeforeUnmount(() => window.removeEventListener('hashchange', synchroniser))
})
</script>

<template>
  <BaseSection id="projets" eyebrow="projets" title="Projets réalisés">
    <!-- La démo est l'élément le plus vérifiable du portfolio : elle mérite
         mieux qu'un bouton au fond de la sixième carte. -->
    <div v-if="projetDemo" v-reveal class="reveal vitrine">
      <div class="vitrine__texte">
        <p class="vitrine__label">à essayer</p>
        <p class="vitrine__accroche">{{ projetDemo.demoAccroche }}</p>
      </div>
      <button
        class="btn btn--primary vitrine__action"
        type="button"
        @click="ouvrirDemo(projetDemo.demo)"
      >
        <span aria-hidden="true">▶</span>
        Lancer la démo
        <span class="sr-only">— {{ projetDemo.titre }}</span>
      </button>
    </div>

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

    <!-- aria-live : un lecteur d'écran ne voit pas les cartes disparaître. -->
    <p class="resultats" role="status" aria-live="polite">
      {{ visibles.length }} {{ visibles.length > 1 ? 'projets' : 'projet' }}
      <template v-if="actif !== 'Tous'">en {{ actif }}</template>
    </p>

    <div class="grid">
      <ProjetCard
        v-for="(p, i) in visibles"
        :key="p.titre"
        v-reveal="i * 60"
        :projet="p"
        :morphe="estMorphee(p)"
        @ouvrir-demo="ouvrirDemo(p.demo)"
        @ouvrir-detail="ouvrirFiche(p)"
      />
    </div>

    <ProjetDetail
      :projet="projetOuvert"
      @fermer="fermerFiche"
      @ouvrir-demo="ouvrirDemoDepuisFiche"
    />

    <component
      :is="demos[demoOuverte]"
      v-if="demoOuverte"
      :ouvert="true"
      @update:ouvert="(valeur: boolean) => { if (!valeur) fermerDemo() }"
    />
  </BaseSection>
</template>

<style scoped>
/* Accentué pour se détacher de la grille, sans crier. */
.vitrine {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--esp-6);
  flex-wrap: wrap;
  padding: var(--esp-5) var(--esp-5);
  margin-bottom: var(--esp-7);
  border: 1px solid var(--line);
  /* Liseré plutôt qu'aplat : un fond coloré jurerait sur des cartes neutres. */
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.vitrine__texte { min-width: 0; }
.vitrine__label {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 var(--esp-1);
}
.vitrine__accroche {
  color: var(--ink);
  font-size: var(--txt-md);
  margin: 0;
  max-width: 62ch;
}
.vitrine__action {
  flex-shrink: 0;
  cursor: pointer;
  font-family: var(--font-body);
}
@media (max-width: 560px) {
  /* Pleine largeur : sinon il se retrouve seul et décentré sur sa ligne. */
  .vitrine__action {
    width: 100%;
    justify-content: center;
  }
}

.filters {
  display: flex;
  gap: var(--esp-3);
  flex-wrap: wrap;
  margin-bottom: var(--esp-4);
}
.resultats {
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--muted);
  margin: 0 0 var(--esp-6);
}
.filters__btn {
  border: 1.5px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  border-radius: var(--radius-sm);
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: var(--txt-sm);
  cursor: pointer;
  transition: all var(--duree-rapide) var(--courbe);
}
.filters__btn:hover { border-color: var(--accent-bright); color: var(--accent); }
.filters__btn--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
.grid {
  display: grid;
  /* `min(310px, 100%)` et non `310px` : sur un écran de 320 px le conteneur
     n'offre que 280 px, et un minimum rigide faisait déborder la page de 10 px
     — défilement horizontal sur toute la grille. */
  grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr));
  gap: var(--esp-6);
}
</style>
