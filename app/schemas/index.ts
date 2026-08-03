// Registre des schémas techniques, sur le modèle des démos : le composant est
// chargé à l'ouverture de la fiche, jamais dans le bundle initial.
//
// Un schéma existe pour les projets qu'on ne peut pas « visiter » — une
// infrastructure réseau n'a pas d'URL. Il vaut mieux qu'un paragraphe.
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const schemas = {
  reseau: defineAsyncComponent(() => import('./reseau/SchemaReseau.vue')),
} satisfies Record<string, Component>

export type SchemaId = keyof typeof schemas
