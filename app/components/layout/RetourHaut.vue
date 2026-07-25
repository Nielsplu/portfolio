<script setup lang="ts">
// Bouton de retour en haut de page.
//
// C'est un LIEN vers l'ancre d'accueil, pas un bouton : le défilement doux est
// alors géré par le CSS (`scroll-behavior` dans base.css, neutralisé par
// prefers-reduced-motion), l'ancre reste focalisable au clavier, et le clic
// milieu ou l'ouverture dans un onglet fonctionnent.
//
// Il n'apparaît qu'après avoir descendu la hauteur d'un écran : plus haut, il
// ne servirait à rien et masquerait du contenu. `visible` vaut false au premier
// rendu côté serveur comme côté client, donc aucun écart d'hydratation.
const visible = ref(false)

onMounted(() => {
  const seuil = () => window.innerHeight
  const surDefilement = () => {
    visible.value = window.scrollY > seuil()
  }
  surDefilement()
  // `passive` : on ne bloque jamais le défilement, l'écouteur ne fait que lire.
  window.addEventListener('scroll', surDefilement, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', surDefilement))
})
</script>

<template>
  <a
    href="#accueil"
    class="retour-haut"
    :class="{ 'retour-haut--visible': visible }"
    :tabindex="visible ? undefined : -1"
    :aria-hidden="visible ? undefined : 'true'"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
    <span class="sr-only">Revenir en haut de la page</span>
  </a>
</template>

<style scoped>
.retour-haut {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 40;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--muted);
  box-shadow: var(--shadow);
  /* Retiré du flux d'interaction tant qu'il est masqué : sans cela il resterait
     cliquable et atteignable au clavier alors qu'il est invisible. */
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
}

.retour-haut--visible {
  opacity: 1;
  visibility: visible;
  transform: none;
}

.retour-haut:hover {
  color: var(--accent);
  border-color: var(--accent-bright);
}

.retour-haut svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Sur petit écran, on se décale pour ne pas recouvrir le contenu au ras du
   bord ni gêner les gestes système. */
@media (max-width: 480px) {
  .retour-haut {
    right: 0.9rem;
    bottom: 0.9rem;
  }
}
</style>
