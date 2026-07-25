// Directive `v-reveal` : fait apparaître un élément (fondu + léger glissement)
// quand il entre dans la vue. Un seul IntersectionObserver partagé pour tout le
// site.
//
// Anti-flash : la classe `js` est posée avant le premier paint par un script en
// <head> (voir nuxt.config), si bien que l'état masqué s'applique dès le premier
// rendu. Accessibilité : prefers-reduced-motion désactive tout en CSS
// (assets/css/motion.css). Robustesse : sans IntersectionObserver, `js` n'est
// jamais posée et le contenu reste visible.
//
// Usage : class="reveal" + v-reveal (délai 0) ou v-reveal="120" (délai en ms,
// pour échelonner).
//
// IMPORTANT — la classe `reveal` s'écrit dans le template, elle n'est PAS
// injectée par getSSRProps. Injectée côté serveur seulement, elle manquait au
// vnode côté client : Vue signalait alors un écart d'hydratation sur chaque
// élément animé (« Hydration class mismatch »), la console se remplissant à
// chaque chargement. Le délai, lui, peut rester dans getSSRProps : absent du
// template, il n'est pas comparé à l'hydratation.
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined

  if (import.meta.client && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer!.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
  }

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps(binding) {
      return binding.value
        ? { style: { '--reveal-delay': `${binding.value}ms` } }
        : {}
    },
    mounted(el: HTMLElement, binding) {
      // Filet de sécurité si la classe a été oubliée dans le template : ajoutée
      // ici, elle n'entre pas dans la comparaison d'hydratation.
      el.classList.add('reveal')
      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      observer?.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
