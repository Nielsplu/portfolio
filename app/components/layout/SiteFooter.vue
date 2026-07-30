<script setup lang="ts">
import { profil } from '~/content'

// Identité réelle du code déployé, à la place d'une commande de terminal
// décorative. Un visiteur peut cliquer sur le commit et lire exactement la
// version qui produit la page qu'il a sous les yeux.
//
// Les deux valeurs sont figées à la compilation (voir nuxt.config) : identiques
// au rendu serveur et au client, donc sans écart d'hydratation possible.
const { depotUrl, commit, dateBuild } = useRuntimeConfig().public

/** Date de build en français, jour et mois abrégé. */
const dateLisible = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(dateBuild)),
)

// L'année du copyright suit la date de build plutôt que l'horloge du visiteur :
// sinon un navigateur mal réglé afficherait une année incohérente, et surtout
// `new Date()` au rendu produisait une valeur différente côté serveur et client.
const annee = computed(() => new Date(dateBuild).getFullYear())
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <span>© {{ annee }} — {{ profil.nom }}</span>

      <p class="footer__build">
        <!-- Masqué si le commit n'a pas pu être déterminé (archive sans dépôt
             git) : mieux vaut ne rien dire qu'afficher un identifiant faux. -->
        <a
          v-if="commit"
          class="footer__commit"
          :href="`${depotUrl}/commit/${commit}`"
          target="_blank"
          rel="noopener"
          :aria-label="`Voir le commit ${commit} sur GitHub (nouvel onglet)`"
        >{{ commit }}</a>
        <span v-if="commit" class="footer__sep" aria-hidden="true">·</span>
        <span>déployé le {{ dateLisible }}</span>
        <span class="footer__sep" aria-hidden="true">·</span>
        <a
          class="footer__source"
          :href="depotUrl"
          target="_blank"
          rel="noopener"
          aria-label="Code source de ce portfolio sur GitHub (nouvel onglet)"
        >code source</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-block: 1.4rem;
  color: var(--muted);
  font-size: var(--txt-sm);
}
.footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.footer__build {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  margin: 0;
}
.footer__sep { color: var(--line); }
.footer__commit,
.footer__source {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--duree-rapide) var(--courbe);
}
.footer__commit:hover,
.footer__source:hover { color: var(--accent-bright); }
/* Le hash se lit comme une référence technique : on le souligne en pointillé
   pour signaler qu'il est cliquable sans en faire un lien ordinaire. */
.footer__commit {
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
</style>
