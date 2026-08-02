<script setup lang="ts">
import { profil } from '~/content'
import { liensNavigation } from '~/sections/ordre'

const open = ref(false)
// Met en surbrillance le lien de la section visible à l'écran.
const actif = useScrollSpy(liensNavigation.map(l => l.href.slice(1)))

// `open` vaut false au premier rendu des deux côtés : libellé réactif sans
// risque d'écart d'hydratation.
const libelleBurger = computed(() => (open.value ? 'Fermer le menu' : 'Ouvrir le menu'))

/** Échap referme le menu et rend le focus, sinon il reste perdu dans un menu
 *  replié. */
const burger = ref<HTMLButtonElement>()
function surEchap() {
  if (!open.value) return
  open.value = false
  burger.value?.focus()
}

const { ouvrir: ouvrirPalette } = usePalette()

// Libellé du raccourci. « Ctrl K » au premier rendu des deux côtés, corrigé
// après montage sur Mac : détecter la plateforme pendant le rendu créerait un
// écart d'hydratation.
const raccourci = ref('Ctrl K')

// La barre ne prend fond, trait et ombre qu'au défilement : en haut de page
// elle se fond dans le hero.
const defile = ref(false)

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform)) raccourci.value = '⌘ K'

  const surDefilement = () => {
    defile.value = window.scrollY > 8
  }
  surDefilement()
  // `passive` : l'écouteur ne fait que lire.
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
      <!-- Hors du menu : restent accessibles quand il est replié. -->
      <div class="nav__actions">
        <button class="nav__palette" type="button" :aria-keyshortcuts="raccourci" @click="ouvrirPalette">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span class="sr-only">Ouvrir la palette de commandes</span>
          <kbd class="nav__raccourci" aria-hidden="true">{{ raccourci }}</kbd>
        </button>
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
  /* Trait déclaré transparent dès maintenant : son apparition changerait
     sinon la hauteur de la barre et ferait sauter le contenu d'un pixel. */
  background: transparent;
  border-bottom: 1px solid transparent;
  /* Flou permanent : le basculer crée puis détruit une couche de composition,
     ce qui saccade sur mobile. */
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
/* Menu déployé : la barre reprend son fond même en haut de page. */
.nav:has(.nav__links--open) {
  background: var(--bg-translucent);
  border-bottom-color: var(--line);
}
.nav__inner {
  display: flex;
  align-items: center;
  gap: var(--esp-6);
  min-height: var(--nav-height);
}
.nav__actions {
  display: flex;
  align-items: center;
  gap: var(--esp-3);
}

/* Un raccourci que personne ne voit n'existe pas : le bouton ouvre la palette
   et affiche du même coup la combinaison de touches. */
.nav__palette {
  display: flex;
  align-items: center;
  gap: var(--esp-2);
  padding: var(--esp-2) var(--esp-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: border-color var(--duree-rapide) var(--courbe), color var(--duree-rapide) var(--courbe);
}
.nav__palette:hover {
  border-color: var(--accent-bright);
  color: var(--accent);
}
.nav__palette svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}
.nav__raccourci {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  letter-spacing: 0.02em;
  color: inherit;
}
/* Sous 640 px la barre est déjà chargée : on ne garde que la loupe, le
   raccourci n'ayant de toute façon pas de sens sans clavier. */
@media (max-width: 640px) {
  .nav__raccourci { display: none; }
  .nav__palette { padding: var(--esp-2); }
}
.nav__logo {
  /* Pousse menu et actions à droite ; `space-between` centrerait le menu. */
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
  gap: var(--esp-6);
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
.nav__cv { padding: var(--esp-2) var(--esp-4); }
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
    padding: var(--esp-5);
    display: none;
  }
  .nav__links--open { display: flex; }
}
</style>
