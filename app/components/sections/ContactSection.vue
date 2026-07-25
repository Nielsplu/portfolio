<script setup lang="ts">
import { profil } from '~/content'

// Nomme la région d'après son titre (voir BaseSection pour le détail).
const idTitre = useId()

const { copier, etat } = usePressePapiers()

/** Libellé du bouton de copie, qui sert aussi de retour au visiteur. */
const libelleCopie = computed(() => ({
  attente: "Copier l'adresse",
  copie: 'Adresse copiée',
  echec: 'Copie impossible',
}[etat.value]))

/** Annonce vocale de l'issue. En cas d'échec, l'adresse reste lisible sous les
 *  boutons : on le dit, plutôt que de laisser le visiteur sans issue. */
const annonceCopie = computed(() => ({
  attente: '',
  copie: 'Adresse copiée dans le presse-papiers',
  echec: `Copie impossible. L'adresse est ${profil.email}`,
}[etat.value]))
</script>

<template>
  <section id="contact" class="section" :aria-labelledby="idTitre">
    <div class="container">
      <div v-reveal class="reveal card contact">
        <p class="eyebrow">contact</p>
        <h2 :id="idTitre" class="section-title contact__title">Travaillons ensemble</h2>
        <p class="contact__text">
          Un projet, une question ? Je réponds rapidement.
        </p>
        <div class="contact__actions">
          <a :href="`mailto:${profil.email}`" class="btn btn--primary">M'envoyer un email</a>
          <button
            class="btn btn--ghost contact__copie"
            :class="{ 'contact__copie--fait': etat === 'copie' }"
            type="button"
            @click="copier(profil.email)"
          >
            {{ libelleCopie }}
          </button>
          <a
            :href="profil.github"
            target="_blank"
            rel="noopener"
            class="btn btn--ghost"
          >GitHub<span class="sr-only"> (nouvel onglet)</span></a>
          <a
            :href="profil.linkedin"
            target="_blank"
            rel="noopener"
            class="btn btn--ghost"
          >LinkedIn<span class="sr-only"> (nouvel onglet)</span></a>
          <a :href="profil.cv" class="btn btn--ghost" download>Télécharger mon CV</a>
        </div>
        <!-- Le changement de libellé du bouton suffit à l'œil, mais le nom
             accessible d'un élément déjà focalisé n'est pas réannoncé de façon
             fiable : cette région annonce l'issue, succès COMME échec — sans
             quoi une copie ratée resterait silencieuse. -->
        <p class="sr-only" role="status" aria-live="polite">
          {{ annonceCopie }}
        </p>
        <p class="contact__meta">{{ profil.localisation }} · {{ profil.email }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 3rem clamp(1.5rem, 5vw, 3.5rem);
  text-align: center;
}
.contact__title { margin-bottom: 0.8rem; }
.contact__text { color: var(--muted); margin: 0 0 1.8rem; }
.contact__actions {
  display: flex;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.contact__copie {
  cursor: pointer;
  font-family: var(--font-body);
  /* Largeur figée sur le libellé le plus long : sinon le bouton se rétrécit au
     passage à « Adresse copiée » et décale ses voisins. */
  min-width: 13.5rem;
  justify-content: center;
}
/* Confirmation de copie : bordure et texte passent au vert, sans changer la
   taille du bouton. */
.contact__copie--fait {
  border-color: var(--succes);
  color: var(--succes);
}
.contact__meta {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--muted);
  margin: 1.8rem 0 0;
}
</style>
