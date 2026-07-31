// Vérifie ce que le build produit réellement, avant déploiement.
//
// Écrit après un incident : le fichier /.well-known/security.txt était bien
// généré, mais GitHub Pages ne le servait pas faute de `.nojekyll`. La CI était
// verte, le site cassé. Un build qui compile ne prouve pas qu'il se déploie.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const RACINE = '.output/public'
const echecs = []

/** Vérifie qu'un fichier existe. */
function fichier(chemin, pourquoi) {
  if (!existsSync(join(RACINE, chemin))) {
    echecs.push(`${chemin} manquant — ${pourquoi}`)
    return false
  }
  return true
}

/** Vérifie qu'un fichier contient un motif. */
function contient(chemin, motif, pourquoi) {
  if (!fichier(chemin, pourquoi)) return
  const contenu = readFileSync(join(RACINE, chemin), 'utf8')
  const trouve = motif instanceof RegExp ? motif.test(contenu) : contenu.includes(motif)
  if (!trouve) echecs.push(`${chemin} ne contient pas ${motif} — ${pourquoi}`)
}

fichier('index.html', 'la page d\'accueil doit être prérendue')
fichier('404.html', 'sans lui, une URL inconnue tombe sur la page 404 de GitHub')
fichier('.nojekyll', 'sans lui, Jekyll ignore les dossiers commençant par un point')

// Le contact sécurité doit exister ET rester valide : un Expires dépassé rend
// le fichier non conforme, ce qu'aucun compilateur ne signalera.
if (fichier('.well-known/security.txt', 'contact sécurité RFC 9116')) {
  const txt = readFileSync(join(RACINE, '.well-known/security.txt'), 'utf8')
  const expires = txt.match(/^Expires:\s*(.+)$/m)?.[1]
  if (!txt.includes('Contact:')) echecs.push('security.txt sans champ Contact')
  if (!expires) echecs.push('security.txt sans champ Expires')
  else if (new Date(expires) <= new Date()) echecs.push(`security.txt expiré le ${expires}`)
}

// Le hero est au-dessus de la ligne de flottaison : si ses variantes d'image
// n'ont pas été générées, la page se charge avec un trou.
contient('index.html', /_ipx\/.*photo\.jpg/, 'les variantes d\'image doivent être générées')

// Marqueurs de conflit Git : déjà arrivé qu'ils soient committés.
contient('index.html', /^(?!.*<<<<<<<)/s, 'aucun marqueur de conflit ne doit être publié')

if (echecs.length) {
  console.error('\nVérification de la sortie : ÉCHEC\n')
  for (const e of echecs) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log('Vérification de la sortie : tout est en place.')
