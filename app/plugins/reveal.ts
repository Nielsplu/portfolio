// Directive `v-reveal` : fait apparaître un élément (fondu + léger glissement)
// quand il entre dans la vue. Un seul IntersectionObserver partagé pour tout le
// site.
//
// Anti-flash : la classe `reveal` est rendue dès le HTML prérendu
// (getSSRProps), et la classe `js` est posée avant le premier paint par un
// script en <head> (voir nuxt.config). L'état masqué s'applique donc au premier
// rendu, sans clignotement. Accessibilité : prefers-reduced-motion désactive
// tout en CSS (assets/css/motion.css). Robustesse : sans IntersectionObserver,
// `js` n'est jamais posée et le contenu reste visible.
//
// Usage : v-reveal (délai 0) ou v-reveal="120" (délai en ms, pour échelonner).
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
      return {
        class: 'reveal',
        ...(binding.value ? { style: { '--reveal-delay': `${binding.value}ms` } } : {}),
      }
    },
    mounted(el: HTMLElement, binding) {
      el.classList.add('reveal')
      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      observer?.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
