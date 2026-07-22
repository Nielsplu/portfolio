<script setup lang="ts">
import type { SimpleIcon } from 'simple-icons'
import { techIcons } from '~/content/tech'

const props = defineProps<{ label: string }>()
// Logo si la techno est connue du registre, sinon simple badge texte.
const icon = computed<SimpleIcon | undefined>(() => techIcons[props.label])
</script>

<template>
  <li
    class="tech"
    :class="{ 'tech--logo': icon }"
    :style="icon ? { '--brand': `#${icon.hex}` } : undefined"
  >
    <svg v-if="icon" class="tech__logo" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="icon.path" />
    </svg>
    <span>{{ label }}</span>
  </li>
</template>

<style scoped>
.tech {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  white-space: nowrap;
}
.tech--logo { transition: background 0.15s ease, transform 0.15s ease; }
.tech__logo {
  width: 0.9rem;
  height: 0.9rem;
  fill: currentColor;
  flex-shrink: 0;
  transition: fill 0.15s ease;
}
/* Au survol d'un badge, son logo prend sa couleur de marque. */
.tech--logo:hover {
  background: var(--surface);
  transform: translateY(-1px);
}
.tech--logo:hover .tech__logo { fill: var(--brand, currentColor); }
</style>
