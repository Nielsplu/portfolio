<script setup lang="ts">
import { profil } from '~/content'
import { liensNavigation } from '~/sections/registry'

const open = ref(false)
// Met en surbrillance le lien de la section visible à l'écran.
const actif = useScrollSpy(liensNavigation.map(l => l.href.slice(1)))
</script>

<template>
  <header class="nav">
    <nav class="container nav__inner" aria-label="Navigation principale">
      <a href="#accueil" class="nav__logo">niels<span>.plu</span></a>
      <button
        class="nav__burger"
        :aria-expanded="open"
        aria-controls="nav-links"
        aria-label="Ouvrir le menu"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>
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
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(246, 248, 251, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 0.85rem;
}
.nav__logo {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 1.05rem;
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
  font-size: 0.95rem;
  transition: color 0.15s ease;
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
  transition: transform 0.2s ease;
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
