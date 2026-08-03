// Prépare une arborescence servable pour Lighthouse.
//
// Le site est déployé sous /portfolio/ : ses assets sont référencés en
// /portfolio/_nuxt/…, alors que le build les dépose à la racine de
// .output/public. Servi tel quel, tout ferait 404 et Lighthouse mesurerait une
// page nue — un score flatteur qui ne dirait rien du vrai site.
//
// On recopie donc la sortie sous un dossier du même nom que le baseURL.

import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE = '.output/public'
const RACINE = '.lighthouse-serve'
const BASE = 'portfolio'

rmSync(RACINE, { recursive: true, force: true })
mkdirSync(RACINE, { recursive: true })
cpSync(SOURCE, join(RACINE, BASE), { recursive: true })

console.log(`Sortie recopiée dans ${join(RACINE, BASE)} — servable sur /${BASE}/`)
