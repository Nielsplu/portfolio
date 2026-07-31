// Registre des démos embarquées. Chaque démo vit dans app/demos/<id>/, ses
// assets dans public/demos/<id>/, et n'est chargée qu'à l'ouverture.
// Pour en ajouter une : référencer le composant ici, puis `demo: '<id>'` sur le
// projet concerné dans app/content/projets.ts.
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const demos = {
  ftp: defineAsyncComponent(() => import('./ftp/DemoFtpTerminal.vue')),
} satisfies Record<string, Component>

export type DemoId = keyof typeof demos
