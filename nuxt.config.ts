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
  // 'build' : vérifie les types au build/CI sans injecter vite-plugin-checker
  // dans le serveur de dev (qui plante avec le baseURL custom ci-dessous).
  typescript: { typeCheck: 'build' },
  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Niels Plu – Portfolio',
      // Pose la classe `js` avant le premier paint : l'état masqué des
      // animations d'apparition s'applique dès le rendu (pas de flash). Ne
      // s'active que si IntersectionObserver existe pour révéler ensuite.
      script: [{
        innerHTML: 'window.IntersectionObserver&&document.documentElement.classList.add("js")',
        tagPosition: 'head',
      }],
      meta: [
        { name: 'description', content: description },
        { name: 'theme-color', content: '#1f4e79' },

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
  nitro: { prerender: { routes: ['/'] } },
})
