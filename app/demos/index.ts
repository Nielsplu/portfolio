// Registre des démos interactives embarquées dans le portfolio.
// Chaque démo vit dans son dossier app/demos/<id>/ (composant, moteur,
// assets sous public/demos/<id>/) et n'est chargée qu'à l'ouverture grâce à
// defineAsyncComponent. Pour ajouter une démo : créer le dossier, référencer
// le composant ici, puis mettre `demo: '<id>'` sur le projet concerné dans
// app/data/portfolio.ts.
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const demos = {
  ftp: defineAsyncComponent(() => import('./ftp/DemoFtpTerminal.vue')),
} satisfies Record<string, Component>

export type DemoId = keyof typeof demos
