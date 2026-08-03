// Résumé de couverture en Markdown, pour la page du run GitHub Actions.
// Aucun service tiers ni jeton : le rapport est déjà produit localement par
// vitest, on ne fait que le mettre en forme.
//
// Le détail par lot compte davantage que le total : la logique est tenue haut,
// la surface d'intégration est à découvert assumé (voir vitest.config.ts).

import { existsSync, readFileSync } from 'node:fs'

const CHEMIN = 'coverage/coverage-summary.json'

if (!existsSync(CHEMIN)) {
  console.log('_Rapport de couverture absent : les tests n\'ont pas abouti._')
  process.exit(0)
}

const SEP = String.fromCharCode(92)
const normaliser = chemin => chemin.split(SEP).join('/')
const resume = JSON.parse(readFileSync(CHEMIN, 'utf8'))
const racine = `${normaliser(process.cwd())}/`

/** Lots affichés, dans l'ordre ; le premier préfixe qui correspond l'emporte. */
const LOTS = [
  ['Utilitaires', 'app/utils/'],
  ['Composables', 'app/composables/'],
  ['Composants', 'app/components/'],
  ['Schémas', 'app/schemas/'],
  ['Démos', 'app/demos/'],
  ['Autres', ''],
]

const parLot = new Map(LOTS.map(([nom]) => [nom, []]))
for (const [fichier, mesures] of Object.entries(resume)) {
  if (fichier === 'total') continue
  const relatif = normaliser(fichier).replace(racine, '')
  const [nom] = LOTS.find(([, prefixe]) => relatif.startsWith(prefixe))
  parLot.get(nom).push(mesures)
}

/** Pourcentage agrégé d'un ensemble de fichiers, arrondi au dixième. */
function pourcentage(fichiers, cle) {
  const couvert = fichiers.reduce((total, m) => total + m[cle].covered, 0)
  const mesure = fichiers.reduce((total, m) => total + m[cle].total, 0)
  return mesure === 0 ? '—' : `${Math.round((couvert / mesure) * 1000) / 10} %`
}

const lignes = ['## Couverture', '', '| | Instructions | Branches | Fonctions | Lignes |', '|---|---:|---:|---:|---:|']

for (const [nom, fichiers] of parLot) {
  if (fichiers.length === 0) continue
  lignes.push(`| ${nom} | ${pourcentage(fichiers, 'statements')} | ${pourcentage(fichiers, 'branches')} | ${pourcentage(fichiers, 'functions')} | ${pourcentage(fichiers, 'lines')} |`)
}

const total = resume.total
lignes.push(`| **Total** | **${total.statements.pct} %** | **${total.branches.pct} %** | **${total.functions.pct} %** | **${total.lines.pct} %** |`)

console.log(lignes.join('\n'))
