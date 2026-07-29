<script setup lang="ts">
import type { SimpleIcon } from 'simple-icons'
import { techIcons } from '~/content/tech'
import { couleurLisible } from '~/utils/couleurs'

const props = defineProps<{ label: string }>()
// Logo si la techno est connue du registre, sinon simple badge texte.
const icon = computed<SimpleIcon | undefined>(() => techIcons[props.label])

// Deux variantes de la couleur de marque, l'une lisible sur fond clair, l'autre
// sur fond sombre. Elles sont calculées ici plutôt que choisies en CSS parce
// qu'elles dépendent de la teinte propre à chaque marque. Le calcul ne dépend
// que des données de l'icône : identique au rendu serveur et à l'hydratation.
const couleurs = computed(() => {
  if (!icon.value) return undefined
  return {
    '--brand-clair': couleurLisible(icon.value.hex, 'clair'),
    '--brand-sombre': couleurLisible(icon.value.hex, 'sombre'),
  }
})
</script>

<template>
  <li
    class="tech"
    :class="{ 'tech--logo': icon }"
    :style="couleurs"
  >
    <svg v-if="icon" class="tech__logo" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="icon.path" />
    </svg>
    <span>{{ label }}</span>
  </li>
</template>

<style scoped>
/* Jeton neutre volontairement : une page de projets aligne plus de 70 badges,
   et les remplir d'aplats d'accent noyait le reste (titres, boutons, liens).
   L'accent est réservé aux éléments qui portent une action ou une hiérarchie ;
   ici la couleur vient du logo de marque, au survol. */
.tech {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: var(--surface-subtle);
  border: 1px solid var(--line);
  color: var(--ink);
  white-space: nowrap;
}
.tech--logo { transition: border-color var(--duree-rapide) var(--courbe), transform var(--duree-rapide) var(--courbe); }
/* Les logos portent leur couleur de marque en permanence : en gris, une page
   qui en aligne plus de soixante-dix paraissait éteinte. La teinte est celle de
   la marque, seule sa luminosité ayant été ramenée dans une plage lisible sur
   le fond courant (voir utils/couleurs.ts). */
.tech__logo {
  width: 0.9rem;
  height: 0.9rem;
  fill: var(--brand-clair, var(--muted));
  flex-shrink: 0;
  transition: fill var(--duree-rapide) var(--courbe);
}
:root[data-theme='dark'] .tech__logo {
  fill: var(--brand-sombre, var(--muted));
}
/* Sans JavaScript, `data-theme` n'est pas posé : on suit alors la préférence
   système, comme le fait la palette. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .tech__logo {
    fill: var(--brand-sombre, var(--muted));
  }
}
.tech--logo:hover {
  border-color: var(--accent-bright);
  transform: translateY(-1px);
}
</style>
