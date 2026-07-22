// Point d'entrée unique du contenu : les composants importent depuis
// '~/content' sans connaître le découpage par domaine.
export { competences } from './competences'
export { parcours } from './parcours'
export { profil } from './profil'
export { projets } from './projets'
export { categoriesProjet } from '~/types/content'
export type * from '~/types/content'
