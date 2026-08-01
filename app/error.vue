<script setup lang="ts">
import type { NuxtError } from '#app'
import { profil } from '~/content'

// Page d'erreur globale. Sans elle, une URL erronée tombe sur la page 404 brute
// de GitHub Pages — hors charte, et sans aucun moyen de revenir au site.
const props = defineProps<{ error: NuxtError }>()

const estIntrouvable = computed(() => props.error.statusCode === 404)

const titre = computed(() =>
  estIntrouvable.value ? 'Page introuvable' : 'Une erreur est survenue',
)

const explication = computed(() =>
  estIntrouvable.value
    ? "Cette adresse ne correspond à aucune page du site. Le lien est peut-être obsolète ou mal recopié."
    : "Quelque chose s'est mal passé de mon côté. Revenir à l'accueil résout généralement le problème.",
)

useHead({ title: `${titre.value} – ${profil.nom}` })

// Le détail technique n'est affiché qu'en développement (voir le template).
const enDev = import.meta.dev

// Retour à l'accueil par un vrai lien plutôt qu'un bouton appelant clearError.
// Trois raisons : c'est une navigation, donc sémantiquement un lien (clic
// milieu, ouverture dans un onglet, lecture par un lecteur d'écran) ; ça ne
// dépend pas de JavaScript ; et sur GitHub Pages la page 404 est une coquille
// SPA — un clic arrivé avant la fin de l'hydratation échouait (NUXT_E1005),
// course impossible avec un lien. Le baseURL vient de la config, pas d'un
// chemin écrit à la main.
const { baseURL } = useRuntimeConfig().app
</script>

<template>
  <div class="erreur">
    <div class="container erreur__inner">
      <p class="eyebrow">erreur {{ error.statusCode }}</p>
      <h1 class="erreur__titre">{{ titre }}</h1>
      <p class="erreur__texte">{{ explication }}</p>

      <div class="erreur__actions">
        <a :href="baseURL" class="btn btn--primary">Retour à l'accueil</a>
        <a :href="profil.github" target="_blank" rel="noopener" class="btn btn--ghost">GitHub</a>
      </div>

      <!-- En développement seulement : le message brut aide au diagnostic, mais
           n'a rien à faire sous les yeux d'un visiteur en production. -->
      <pre v-if="enDev && error.message" class="erreur__details">{{ error.message }}</pre>
    </div>
  </div>
</template>

<style scoped>
.erreur {
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  text-align: center;
}
.erreur__inner {
  max-width: 46ch;
}
.erreur__titre {
  font-size: var(--txt-2xl);
  margin-bottom: var(--esp-4);
}
.erreur__texte {
  color: var(--muted);
  margin: 0 0 var(--esp-7);
}
.erreur__actions {
  display: flex;
  justify-content: center;
  gap: var(--esp-4);
  flex-wrap: wrap;
}
.erreur__details {
  margin-top: var(--esp-8);
  padding: var(--esp-4) var(--esp-5);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  text-align: left;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style>
