<script setup lang="ts">
import { profil } from '~/content'
import { liensNavigation } from '~/sections/ordre'

const open = ref(false)
// Met en surbrillance le lien de la section visible à l'écran.
const actif = useScrollSpy(liensNavigation.map(l => l.href.slice(1)))

// Le burger est rendu identiquement au serveur et au client (`open` vaut
// toujours false au premier rendu), son libellé peut donc être réactif sans
// risque d'écart d'hydratation — contrairement à l'interrupteur de thème, dont
// l'état dépend du visiteur.
const libelleBurger = computed(() => (open.value ? 'Fermer le menu' : 'Ouvrir le menu'))

/** Referme le menu à la touche Échap et redonne le focus au burger, pour ne pas
 *  laisser le visiteur au clavier avec un focus perdu dans un menu replié. */
const burger = ref<HTMLButtonElement>()
function surEchap() {
  if (!open.value) return
  open.value = false
  burger.value?.focus()
}

// La barre ne prend son fond, son trait et son ombre qu'une fois le défilement
// entamé. En haut de page elle se fond dans le hero : plus de ligne qui coupe
// l'écran en deux dès l'arrivée, et le relief n'apparaît qu'au moment où il
// sert vraiment, quand du contenu passe dessous.
// `defile` vaut false au rendu serveur comme au premier rendu client : aucun
// écart d'hydratation possible.
const defile = ref(false)

onMounted(() => {
  const surDefilement = () => {
    defile.value = window.scrollY > 8
  }
  surDefilement()
  // `passive` : l'écouteur ne fait que lire, il ne doit jamais retarder le
  // défilement.
  window.addEventListener('scroll', surDefilement, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', surDefilement))
})
</script>

<template>
  <header class="nav" :class="{ 'nav--defile': defile }" @keydown.esc="surEchap">
    <nav class="container nav__inner" aria-label="Navigation principale">
      <a href="#accueil" class="nav__logo">niels<span>.plu</span></a>
      <ul id="nav-links" class="nav__links" :class="{ 'nav__links--open': open }">
        <li v-for="l in liensNavigation" :key="l.href">
          <a
            :href="l.href"
            :class="{ 'is-active': actif === l.href.slice(1) }"
            :aria-current="actif === l.href.slice(1) ? 'true' : undefined"
            @click="open = false"
          >{{ l.label }}</a>
        </li>
        <li>
          <a :href="profil.cv" class="btn btn--primary nav__cv" download>CV</a>
        </li>
      </ul>
      <!-- Hors du menu déroulant : la bascule de thème et le burger restent
           accessibles dans la barre même quand le menu mobile est replié. -->
      <div class="nav__actions">
        <ThemeToggle />
        <button
          ref="burger"
          class="nav__burger"
          :aria-expanded="open"
          aria-controls="nav-links"
          :aria-label="libelleBurger"
          @click="open = !open"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  /* Transparente en haut de page ; le fond, le trait et l'ombre n'arrivent
     qu'au défilement (voir .nav--defile). Le trait est déclaré dès maintenant
     en transparent : sans lui, son apparition modifierait la hauteur de la
     barre et ferait sauter le contenu d'un pixel. */
  background: transparent;
  border-bottom: 1px solid transparent;
  /* Le flou reste actif en permanence : le basculer déclenche la création puis
     la destruction d'une couche de composition, ce qui saccade sur mobile.
     Sans fond derrière lui, il ne se voit pas. */
  backdrop-filter: blur(10px);
  transition:
    background var(--duree-moyenne) var(--courbe),
    border-color var(--duree-moyenne) var(--courbe),
    box-shadow var(--duree-moyenne) var(--courbe);
}
.nav--defile {
  background: var(--bg-translucent);
  border-bottom-color: var(--line);
  box-shadow: var(--shadow-sm);
}
/* Menu mobile déployé : la barre reprend son fond même en haut de page, sans
   quoi les liens flotteraient au-dessus du hero sans support visuel. */
.nav:has(.nav__links--open) {
  background: var(--bg-translucent);
  border-bottom-color: var(--line);
}
.nav__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: var(--nav-height);
}
.nav__actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.nav__logo {
  /* Pousse le menu et les actions à droite : pas de `space-between` sur
     .nav__inner, qui centrerait le menu entre le logo et les actions. */
  margin-right: auto;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: var(--txt-lg);
  color: var(--ink);
  text-decoration: none;
}
.nav__logo span { color: var(--accent-bright); }
.nav__links {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav__links a:not(.btn) {
  position: relative;
  text-decoration: none;
  color: var(--muted);
  font-weight: 500;
  font-size: var(--txt-md);
  transition: color var(--duree-rapide) var(--courbe);
}
.nav__links a:not(.btn):hover { color: var(--accent); }
/* Lien de la section active : couleur d'accent + soulignement animé. */
.nav__links a.is-active { color: var(--accent); }
.nav__links a:not(.btn)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duree-moyenne) var(--courbe);
}
.nav__links a.is-active::after { transform: scaleX(1); }
@media (max-width: 720px) {
  .nav__links a:not(.btn)::after { display: none; }
}
.nav__cv { padding: 0.4rem 1rem; }
.nav__burger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.nav__burger span {
  width: 22px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
}
@media (max-width: 720px) {
  .nav__burger { display: flex; }
  .nav__links {
    position: absolute;
    inset: 100% 0 auto 0;
    flex-direction: column;
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    padding: 1.2rem;
    display: none;
  }
  .nav__links--open { display: flex; }
}
</style>
