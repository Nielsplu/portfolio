// Directive `v-reveal` : fait apparaître un élément à son entrée dans la vue.
// Un seul IntersectionObserver pour tout le site.
//
// Usage : class="reveal" + v-reveal, ou v-reveal="120" pour échelonner (ms).
// Sans IntersectionObserver, la classe `js` n'est jamais posée et le contenu
// reste visible ; prefers-reduced-motion neutralise tout en CSS.
//
// La classe `reveal` s'écrit dans le template et non dans getSSRProps :
// injectée côté serveur seulement, elle manquait au vnode client et Vue
// signalait un écart d'hydratation sur chaque élément animé.
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
      // Filet si la classe a été oubliée dans le template.
      el.classList.add('reveal')
      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      observer?.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
