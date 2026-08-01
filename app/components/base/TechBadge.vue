<script setup lang="ts">
import type { SimpleIcon } from 'simple-icons'
import { techIcons } from '~/content/tech'
import { couleurLisible } from '~/utils/couleurs'

const props = defineProps<{
  label: string
  /** Présent, le jeton devient un lien vers la pièce justificative (certificat
   *  PDF…), ouverte dans un nouvel onglet pour ne pas quitter le portfolio. */
  justificatif?: string
}>()
// Logo si la techno est connue du registre, sinon simple badge texte.
const icon = computed<SimpleIcon | undefined>(() => techIcons[props.label])

// Calculées ici et non en CSS : elles dépendent de la teinte de chaque marque.
// Ne dépend que des données de l'icône, donc stable à l'hydratation.
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
    :class="{ 'tech--logo': icon, 'tech--lien': justificatif }"
    :style="couleurs"
  >
    <!-- Un lien seulement s'il y a une pièce à consulter. -->
    <component
      :is="justificatif ? 'a' : 'span'"
      v-bind="justificatif ? {
        href: justificatif,
        target: '_blank',
        rel: 'noopener',
        'aria-label': `${label} — voir le certificat (nouvel onglet)`,
      } : {}"
      class="tech__contenu"
    >
      <svg v-if="icon" class="tech__logo" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="icon.path" />
      </svg>
      <span>{{ label }}</span>
      <span v-if="justificatif" class="tech__preuve" aria-hidden="true">↗</span>
    </component>
  </li>
</template>

<style scoped>
/* Neutre volontairement : plus de 70 badges en aplat d'accent noyaient
   titres, boutons et liens. */
.tech {
  display: inline-flex;
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  border-radius: 6px;
  background: var(--surface-subtle);
  border: 1px solid var(--line);
  color: var(--ink);
  white-space: nowrap;
}
/* Rembourrage sur le contenu : toute la surface du badge devient cliquable. */
.tech__contenu {
  display: inline-flex;
  align-items: center;
  gap: var(--esp-2);
  padding: var(--esp-1) var(--esp-3);
  color: inherit;
  text-decoration: none;
}
/* Un jeton cliquable doit se distinguer d'une simple étiquette. */
.tech--lien {
  border-color: var(--accent-soft);
  transition: border-color var(--duree-rapide) var(--courbe), transform var(--duree-rapide) var(--courbe);
}
.tech--lien:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}
.tech__preuve {
  color: var(--accent);
  font-size: 0.9em;
}
.tech--logo { transition: border-color var(--duree-rapide) var(--courbe), transform var(--duree-rapide) var(--courbe); }
/* Couleur de marque en permanence : en gris, la page paraissait éteinte.
   Seule la luminosité est ajustée au fond (voir utils/couleurs.ts). */
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
/* Sans JS, `data-theme` n'est pas posé : on suit la préférence système. */
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
