// Budget de poids de la page d'accueil, vérifié après build.
//
// Le poids ne se dégrade jamais d'un coup : il glisse, une dépendance à la
// fois, et personne ne s'en aperçoit. Ces plafonds font échouer la CI avant
// que ce soit le cas.
//
// Les mesures sont gzippées, parce que c'est ce qui transite réellement :
// raisonner sur le brut fait surestimer le coût du markup répétitif, que gzip
// absorbe très bien (le sprite SVG a fait −39 Ko de markup pour −15 Ko de
// transfert).
//
// Les plafonds gardent une marge d'environ 15 % sur le mesuré : assez pour ne
// pas casser au premier ajustement, trop peu pour laisser passer une
// dépendance entière. À revoir consciemment plutôt qu'à relever d'un cran
// quand ça coince.

import { readFileSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const RACINE = '.output/public'

const BUDGETS = [
  { nom: 'HTML de l\'accueil', plafond: 40, mesurer: () => poids([join(RACINE, 'index.html')]) },
  { nom: 'JavaScript total', plafond: 130, mesurer: () => poids(fichiers('.js')) },
  { nom: 'CSS total', plafond: 15, mesurer: () => poids(fichiers('.css')) },
  // Un seul gros paquet bloque le premier rendu : on surveille aussi le pire.
  { nom: 'plus gros paquet JS', plafond: 115, mesurer: () => Math.max(...fichiers('.js').map(f => poids([f]))) },
]

/** Fichiers de `_nuxt` portant l'extension donnée. */
function fichiers(extension) {
  const dossier = join(RACINE, '_nuxt')
  return readdirSync(dossier).filter(f => f.endsWith(extension)).map(f => join(dossier, f))
}

/** Poids gzippé cumulé, en kilooctets. */
function poids(chemins) {
  const octets = chemins.reduce((total, chemin) => total + gzipSync(readFileSync(chemin)).length, 0)
  return Math.round((octets / 1024) * 10) / 10
}

const echecs = []
const lignes = []

for (const { nom, plafond, mesurer } of BUDGETS) {
  const mesure = mesurer()
  const marge = Math.round(((plafond - mesure) / plafond) * 100)
  lignes.push(`  ${nom.padEnd(22)} ${String(mesure).padStart(6)} Ko / ${plafond} Ko   (${marge} % de marge)`)
  if (mesure > plafond) echecs.push(`${nom} : ${mesure} Ko dépasse le plafond de ${plafond} Ko`)
}

console.log('Budget de poids (gzippé) :')
console.log(lignes.join('\n'))

if (echecs.length > 0) {
  console.error('\nBudget dépassé :')
  for (const echec of echecs) console.error(`  - ${echec}`)
  console.error('\nRelever un plafond est une décision, pas un réflexe : vérifier d\'abord')
  console.error('ce qui a grossi, avec `npx nuxi analyze`.')
  process.exit(1)
}

console.log('\nTout tient dans le budget.')
