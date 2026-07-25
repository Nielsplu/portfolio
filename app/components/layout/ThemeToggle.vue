<script setup lang="ts">
// Bouton de bascule clair / sombre.
//
// Particularité assumée : ce composant ne tient AUCUN état réactif. L'icône
// affichée et le libellé lu par les lecteurs d'écran sont sélectionnés en CSS
// d'après `data-theme` sur <html>. Deux bénéfices :
//   - le HTML prérendu et l'hydratation sont identiques (pas de mismatch,
//     alors que le serveur ne peut pas connaître le thème du visiteur) ;
//   - le bon état s'affiche dès le premier paint, sans clignotement.
const { basculer } = useTheme()
</script>

<template>
  <button class="theme-toggle" type="button" @click="basculer">
    <!-- Thème clair actif : on propose de passer au sombre. -->
    <span class="theme-toggle__etat theme-toggle__etat--vers-sombre">
      <svg class="theme-toggle__icone" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a7 7 0 0 0 10.8 10.8Z" />
      </svg>
      <span class="sr-only">Passer au thème sombre</span>
    </span>

    <!-- Thème sombre actif : on propose de revenir au clair. -->
    <span class="theme-toggle__etat theme-toggle__etat--vers-clair">
      <svg class="theme-toggle__icone" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6" />
      </svg>
      <span class="sr-only">Passer au thème clair</span>
    </span>
  </button>
</template>

<style scoped>
/* Sans JavaScript, `data-theme` n'est jamais posé : le bouton serait inopérant
   et les deux icônes s'afficheraient. On le masque donc, et les tokens
   `light-dark()` font suivre la préférence système. */
.theme-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

:root[data-theme] .theme-toggle {
  display: inline-flex;
}

.theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent-bright);
}

.theme-toggle__etat {
  display: inline-flex;
}

.theme-toggle__icone {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Une seule des deux icônes est rendue : `display: none` la retire aussi de
   l'arbre d'accessibilité, si bien que le nom accessible du bouton est
   toujours celui de l'action réellement disponible. */
.theme-toggle__etat--vers-clair {
  display: none;
}

:root[data-theme='dark'] .theme-toggle__etat--vers-sombre {
  display: none;
}

:root[data-theme='dark'] .theme-toggle__etat--vers-clair {
  display: inline-flex;
}
</style>
