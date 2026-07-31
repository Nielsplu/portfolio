<script setup lang="ts">
// Interrupteur clair / sombre.
//
// Les deux options restent visibles : un soleil seul serait ambigu — thème
// clair actif, ou clic pour éclaircir ?
//
// Aucun état réactif : position du repère et libellé viennent du CSS, d'après
// `data-theme`. Le serveur ne peut pas connaître le thème du visiteur, donc
// tout état rendu provoquerait un écart d'hydratation.
const { basculer } = useTheme()
</script>

<template>
  <button class="theme-switch" type="button" @click="basculer">
    <!-- Repère du thème actif : glisse d'une option à l'autre. -->
    <span class="theme-switch__repere" aria-hidden="true" />

    <span class="theme-switch__option theme-switch__option--clair">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6" />
      </svg>
    </span>

    <span class="theme-switch__option theme-switch__option--sombre">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a7 7 0 0 0 10.8 10.8Z" />
      </svg>
    </span>

    <!-- Décrit l'action, pas l'état. Une seule variante est rendue, l'autre
         étant en display:none donc hors de l'arbre d'accessibilité. -->
    <span class="sr-only theme-switch__libelle--vers-sombre">Passer au thème sombre</span>
    <span class="sr-only theme-switch__libelle--vers-clair">Passer au thème clair</span>
  </button>
</template>

<style scoped>
/* Sans JS, `data-theme` n'est jamais posé : l'interrupteur serait inopérant. */
.theme-switch {
  display: none;
  position: relative;
  align-items: center;
  width: 54px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--line);
  /* Piste anguleuse plutôt que pilule, comme le reste du site. */
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
  cursor: pointer;
}

:root[data-theme] .theme-switch {
  display: inline-flex;
}

.theme-switch:hover {
  border-color: var(--accent-bright);
}

/* Le repère se comprime à l'enfoncement : sensation d'interrupteur. */
.theme-switch:active .theme-switch__repere {
  transform: scaleX(0.88);
}
:root[data-theme='dark'] .theme-switch:active .theme-switch__repere {
  transform: translateX(24px) scaleX(0.88);
}
.theme-switch__repere {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 22px;
  border-radius: 6px;
  background: var(--accent);
  box-shadow: var(--shadow-sm);
  /* Seule `transform` est animée : sa valeur est littérale, jamais issue d'une
     variable de thème, donc épargnée par le défaut de recalcul décrit dans
     motion.css — où ce repère est justement exempté de la coupure. */
  transition: transform var(--duree-moyenne) var(--courbe);
}

:root[data-theme='dark'] .theme-switch__repere {
  transform: translateX(24px);
}

.theme-switch__option {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  flex: 1;
  color: var(--muted);
  transition: color var(--duree-rapide) var(--courbe);
}

.theme-switch__option svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* L'icône sur le repère passe en couleur « sur accent ». */
:root[data-theme='light'] .theme-switch__option--clair,
:root[data-theme='dark'] .theme-switch__option--sombre {
  color: var(--on-accent);
}

.theme-switch__libelle--vers-clair {
  display: none;
}

:root[data-theme='dark'] .theme-switch__libelle--vers-sombre {
  display: none;
}

:root[data-theme='dark'] .theme-switch__libelle--vers-clair {
  display: inline;
}
</style>
