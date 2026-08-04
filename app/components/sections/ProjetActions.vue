<script setup lang="ts">
import type { Projet } from '~/types/content'
import { versSlug } from '~/utils/slug'

// Actions d'un projet, partagées par la carte et la fiche.
//
// Les deux les rendaient séparément, avec des classes différentes et un
// contenu qui avait divergé : la fiche du projet FTP n'offrait pas sa démo, et
// celle du Warhammer n'offrait rien du tout. Ouvrir le détail faisait donc
// perdre des actions au lieu d'en donner.

const props = defineProps<{
  projet: Projet
  /** `carte` : jetons compacts en pied de carte. `fiche` : boutons pleins. */
  variante: 'carte' | 'fiche'
}>()

defineEmits<{ 'ouvrir-demo': [], 'ouvrir-detail': [] }>()

// Pas de bouton sans matière à montrer : il promettrait une fenêtre vide.
const aDuDetail = computed(() =>
  Boolean(props.projet.details?.length || props.projet.images?.length || props.projet.schema),
)

const { copier, etat } = usePressePapiers()

/** Adresse partageable de la fiche, celle-là même qu'affiche la barre. */
function lienDeLaFiche(): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#projet/${versSlug(props.projet.titre)}`
}

const libelleCopie = computed(() => ({
  attente: 'Copier le lien',
  copie: 'Lien copié',
  echec: 'Copie impossible',
}[etat.value]))
</script>

<template>
  <!-- La fiche a toujours une adresse partageable : elle a donc toujours au
       moins une action, même pour un projet sans lien ni démo. -->
  <div
    v-if="variante === 'fiche' || aDuDetail || projet.liens?.length || projet.demo || projet.codePrive"
    class="actions"
    :class="`actions--${variante}`"
  >
    <!-- Réservé à la carte : depuis la fiche, on y est déjà. -->
    <button
      v-if="variante === 'carte' && aDuDetail"
      class="actions__item actions__item--detail"
      type="button"
      @click="$emit('ouvrir-detail')"
    >
      En savoir plus
      <!-- Sans ce suffixe, six boutons porteraient le même nom. -->
      <span class="sr-only">— {{ projet.titre }}</span>
    </button>

    <button
      v-if="projet.demo"
      class="actions__item actions__item--demo"
      type="button"
      @click="$emit('ouvrir-demo')"
    >
      <span aria-hidden="true">▶</span> Tester ici
      <span v-if="variante === 'fiche'" class="sr-only">— {{ projet.titre }}</span>
    </button>

    <a
      v-for="lien in projet.liens"
      :key="lien.url"
      class="actions__item"
      :href="lien.url"
      target="_blank"
      rel="noopener"
    >{{ lien.label }} <span aria-hidden="true">↗</span><span class="sr-only">(nouvel onglet)</span></a>

    <!-- L'adresse de la fiche est partageable depuis toujours, sans que rien
         ne le laisse deviner. -->
    <button
      v-if="variante === 'fiche'"
      class="actions__item actions__item--copie"
      type="button"
      @click="copier(lienDeLaFiche())"
    >{{ libelleCopie }}</button>

    <!-- Une carte sans aucune action laisse penser à un oubli. -->
    <span v-if="projet.codePrive" class="actions__item actions__item--prive">Code privé</span>

    <!-- Le nom accessible d'un élément déjà focalisé n'est pas réannoncé de
         façon fiable : l'issue passe par une région dédiée. -->
    <p v-if="variante === 'fiche'" class="sr-only" role="status">
      {{ etat === 'attente' ? '' : libelleCopie }}
    </p>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--esp-3);
}
.actions--carte { margin-top: var(--esp-4); }
.actions--fiche {
  align-items: center;
  padding-top: var(--esp-2);
}

.actions__item {
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: transparent;
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--duree-rapide) var(--courbe);
}
/* Le fond doit être déclaré : sans lui, un <button> prend celui du navigateur,
   gris moyen bien visible en thème sombre. */
.actions__item:hover {
  border-color: var(--accent-bright);
  background: var(--accent);
  color: var(--on-accent);
}

.actions__item--demo {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
.actions__item--demo:hover { background: var(--accent-bright); }

/* Bordée mais non remplie : ne concurrence pas le bouton de démo. */
.actions__item--detail { border-color: var(--accent); }

/* Inerte : tirets pour le distinguer d'un lien au premier coup d'œil. */
.actions__item--prive {
  border-style: dashed;
  color: var(--muted);
  cursor: default;
}
.actions__item--prive:hover {
  border-color: var(--line);
  background: transparent;
  color: var(--muted);
}

/* Largeur figée : le libellé change au clic, et le bouton décalerait ses
   voisins à chaque copie. */
.actions__item--copie { min-width: 13ch; }

/* Dans la fiche, les actions sont l'aboutissement de la lecture : elles
   méritent la taille d'un vrai bouton. */
.actions--fiche .actions__item {
  font-family: var(--font-body);
  font-size: var(--txt-sm);
  padding: var(--esp-3) var(--esp-5);
}
</style>
