// GitHub Pages : le site sera servi sur https://nielsplu.github.io/portfolio/
const baseURL = process.env.NUXT_APP_BASE_URL || '/portfolio/'
const siteUrl = `https://nielsplu.github.io${baseURL}`
const description = "Portfolio de Niels Plu, étudiant en 3ᵉ année de BUT Informatique à l'IUT de Nantes — développement web et sécurité des systèmes d'information."

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts'],
  // Design system découpé : tokens → base → classes partagées.
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
    '~/assets/css/motion.css',
  ],
  // Nom des composants = nom de fichier, sans préfixe du dossier
  // (BaseSection, SiteNav…) : les sous-dossiers restent purement organisationnels.
  components: [{ path: '~/components', pathPrefix: false }],
  // Exposé au client pour construire les URL absolues des données structurées
  // (app.vue) : une seule définition de l'URL du site, ici.
  runtimeConfig: { public: { siteUrl } },
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
        { property: 'og:image', content: `${siteUrl}photo.jpg` },
        { property: 'og:locale', content: 'fr_FR' },

        // Twitter Card (repris par certains clients email/messagerie aussi)
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Niels Plu – Portfolio' },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: `${siteUrl}photo.jpg` },
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
  nitro: { prerender: { routes: ['/', '/404.html'] } },
})
