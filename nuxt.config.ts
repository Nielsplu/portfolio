import { execSync } from 'node:child_process'

// GitHub Pages : le site sera servi sur https://nielsplu.github.io/portfolio/
const baseURL = process.env.NUXT_APP_BASE_URL || '/portfolio/'
const siteUrl = `https://nielsplu.github.io${baseURL}`
const depotUrl = 'https://github.com/Nielsplu/portfolio'

/**
 * Commit à partir duquel ce site est construit, en version courte.
 *
 * GitHub Actions expose GITHUB_SHA : c'est la source qui fait foi en CI, où le
 * dépôt est parfois cloné sans historique. En local on interroge git. Si les
 * deux échouent — archive téléchargée, git absent — on renvoie une chaîne vide
 * et le pied de page masque simplement la mention, plutôt que d'afficher un
 * identifiant faux.
 */
function commitCourant(): string {
  const depuisCi = process.env.GITHUB_SHA
  if (depuisCi) return depuisCi.slice(0, 7)
  try {
    return execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  }
  catch {
    return ''
  }
}
const description = "Portfolio de Niels Plu, étudiant en 3ᵉ année de BUT Informatique à l'IUT de Nantes — développement web et sécurité des systèmes d'information."

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/image'],
  // Optimisation des images au build (sharp), pas à l'exécution : GitHub Pages
  // sert des fichiers statiques et ne peut rien redimensionner à la volée. Les
  // variantes sont donc générées pendant le prérendu et déposées dans le
  // dossier public. Voir HeroSection pour l'usage de <NuxtImg>.
  image: {
    quality: 72,
  },
  // Design system découpé : tokens → base → classes partagées.
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
    '~/assets/css/motion.css',
    // En dernier : ses surcharges de tokens doivent l'emporter à l'impression.
    '~/assets/css/print.css',
  ],
  // Nom des composants = nom de fichier, sans préfixe du dossier
  // (BaseSection, SiteNav…) : les sous-dossiers restent purement organisationnels.
  components: [{ path: '~/components', pathPrefix: false }],
  // Exposé au client pour construire les URL absolues des données structurées
  // (app.vue) : une seule définition de l'URL du site, ici.
  // Figées à la compilation, donc identiques au rendu serveur et au client :
  // aucun risque d'écart d'hydratation, contrairement à une date calculée au
  // moment de l'affichage.
  runtimeConfig: {
    public: {
      siteUrl,
      depotUrl,
      commit: commitCourant(),
      dateBuild: new Date().toISOString(),
    },
  },
  // 'build' : vérifie les types au build/CI sans injecter vite-plugin-checker
  // dans le serveur de dev (qui plante avec le baseURL custom ci-dessous).
  typescript: { typeCheck: 'build' },
  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Niels Plu – Portfolio',
      // Deux réglages posés avant le premier paint, donc sans clignotement :
      //   1. classe `js` — l'état masqué des animations d'apparition s'applique
      //      dès le rendu. Conditionnée à IntersectionObserver, seul capable de
      //      les révéler ensuite (sinon le contenu resterait invisible).
      //   2. attribut `data-theme` — thème choisi par le visiteur, sinon sa
      //      préférence système. Il sélectionne la palette sombre dans
      //      assets/css/tokens.css. Sa présence sert aussi de test de support :
      //      le bouton de bascule n'apparaît que si l'attribut existe (voir
      //      ThemeToggle.vue), puisque sans JS il serait inopérant.
      // La clé de stockage doit rester alignée avec CLE_THEME
      // (app/composables/useTheme.ts).
      script: [{
        innerHTML: `window.IntersectionObserver&&document.documentElement.classList.add("js");`
          + `try{var t=localStorage.getItem("niels-theme");`
          + `document.documentElement.dataset.theme=t==="light"||t==="dark"?t`
          + `:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`,
        tagPosition: 'head',
      }],
      meta: [
        { name: 'description', content: description },
        // Teinte de l'interface du navigateur : suit le fond réel de la page
        // dans chaque thème (--bg de assets/css/tokens.css).
        { name: 'theme-color', content: '#f6f8fb', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0c111a', media: '(prefers-color-scheme: dark)' },

        // Open Graph : aperçu du lien sur LinkedIn, WhatsApp, email…
        { property: 'og:type', content: 'profile' },
        { property: 'og:title', content: 'Niels Plu – Portfolio' },
        { property: 'og:description', content: description },
        { property: 'og:url', content: siteUrl },
        { property: 'og:locale', content: 'fr_FR' },
        // og:image et twitter:image sont déclarés dans app.vue : leur URL est
        // calculée par @nuxt/image, hors de portée d'un fichier de config.

        // Twitter Card (repris par certains clients email/messagerie aussi)
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Niels Plu – Portfolio' },
        { name: 'twitter:description', content: description },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'canonical', href: siteUrl },
      ],
    },
  },
  // `/404.html` est prérendu en plus de l'accueil : GitHub Pages sert
  // automatiquement ce fichier pour toute adresse inconnue. Sans lui, une URL
  // erronée tombe sur la page 404 générique de GitHub et app/error.vue ne
  // serait jamais vu (il ne couvrirait que les erreurs de navigation interne).
  nitro: {
    // Ce préréglage dépose un `.nojekyll` à la racine du site publié. Sans lui,
    // GitHub Pages passe la sortie à Jekyll, qui ignore tout dossier commençant
    // par un point : /.well-known/security.txt répondait 404 en production alors
    // qu'il était bien présent dans l'artefact.
    preset: 'github_pages',
    prerender: {
      routes: [
        '/',
        '/404.html',
        // Route Nitro rendue en fichier statique : GitHub Pages n'exécute rien
        // côté serveur (voir server/routes/.well-known/security.txt.get.ts).
        '/.well-known/security.txt',
      ],
    },
  },
})
