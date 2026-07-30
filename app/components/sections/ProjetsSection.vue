<script setup lang="ts">
import type { DemoId } from '~/demos'
import type { Projet } from '~/types/content'
import { categoriesProjet, projets } from '~/content'
import { demos } from '~/demos'
import { filtrerParCategorie } from '~/utils/filtres'

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

// Projet dont la fiche est ouverte. Une seule fenêtre à la fois, gérée ici
// plutôt que dans chaque carte : sinon six instances de la fiche coexisteraient
// dans le DOM, et deux pourraient s'ouvrir en même temps.
const projetOuvert = ref<Projet | null>(null)
</script>

<template>
  <BaseSection id="projets" eyebrow="projets" title="Projets réalisés">
    <!-- Bandeau de mise en avant : la démo était la chose la plus vérifiable du
         portfolio — un vrai binaire exécuté dans le navigateur — et n'était
         atteignable qu'en lisant la sixième carte jusqu'au bout. -->
    <div v-if="projetDemo" v-reveal class="reveal vitrine">
      <div class="vitrine__texte">
        <p class="vitrine__label">à essayer</p>
        <p class="vitrine__accroche">{{ projetDemo.demoAccroche }}</p>
      </div>
      <button
        class="btn btn--primary vitrine__action"
        type="button"
        @click="demoOuverte = projetDemo.demo ?? null"
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

    <!-- Le filtre ne disait rien de son effet : ce compteur l'annonce à l'œil
         et, via aria-live, au lecteur d'écran qui ne voit pas les cartes
         disparaître. -->
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
        @ouvrir-demo="demoOuverte = p.demo ?? null"
        @ouvrir-detail="projetOuvert = p"
      />
    </div>

    <ProjetDetail :projet="projetOuvert" @fermer="projetOuvert = null" />

    <component
      :is="demos[demoOuverte]"
      v-if="demoOuverte"
      :ouvert="true"
      @update:ouvert="(valeur: boolean) => { if (!valeur) demoOuverte = null }"
    />
  </BaseSection>
</template>

<style scoped>
/* Bandeau de démo : accentué pour se détacher de la grille, mais sans crier —
   il reste un raccourci vers un projet, pas une publicité. */
.vitrine {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.4rem;
  flex-wrap: wrap;
  padding: 1.1rem 1.3rem;
  margin-bottom: 1.8rem;
  border: 1px solid var(--line);
  /* Liseré d'accent sur la tranche : marque l'élément sans remplir un aplat
     coloré, qui jurerait au-dessus des cartes neutres. */
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.vitrine__texte { min-width: 0; }
.vitrine__label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-bright);
  margin: 0 0 0.3rem;
}
.vitrine__accroche {
  color: var(--ink);
  font-size: 0.93rem;
  margin: 0;
  max-width: 62ch;
}
.vitrine__action {
  flex-shrink: 0;
  cursor: pointer;
  font-family: var(--font-body);
}
@media (max-width: 560px) {
  /* Le bouton passe pleine largeur : coincé à droite d'un texte qui a bouclé,
     il se retrouvait seul sur une ligne, décentré. */
  .vitrine__action {
    width: 100%;
    justify-content: center;
  }
}

.filters {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.resultats {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0 0 1.4rem;
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
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.4rem;
}
</style>
