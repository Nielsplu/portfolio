// Chargeur de la démo FTP réelle : le binaire WebAssembly compilé depuis
// github.com/Nielsplu/ftp-go (cmd/wasm) fait tourner le vrai serveur et le
// vrai client Go dans la page, reliés par le réseau loopback en mémoire.
// Ce module fournit au runtime Go (wasm_exec.js) un système de fichiers
// virtuel : data/ et hiddenFile.txt sont seedés depuis un manifeste des vrais
// fichiers du repo, et les écritures du client dans downloads/ restent
// récupérables pour déclencher un téléchargement navigateur.

interface FichierManifeste {
  chemin: string
  b64?: string
  taille?: number
  synthetique?: boolean
}

export interface ManifesteDemo {
  hiddenFileB64: string
  dossiers: string[]
  fichiers: FichierManifeste[]
}

interface EvenementsFtp {
  log: (origine: string, contenu: string) => void
  cwd: (vers: string) => void
  progress: (nom: string, pourcent: number) => void
  progressEnd: (nom: string) => void
  quit: () => void
  fatal: (message: string, details: string) => void
}

interface PontFtp {
  ready: boolean
  connect: (rappel: (type: string, ...args: unknown[]) => void, port?: string) => void
  send: (ligne: string) => void
}

// Pour les fichiers, `donnees` est la capacité allouée et `taille` la longueur
// logique : la croissance par doublement évite une recopie du fichier entier à
// chaque append du client (sensible sur les 37 Mo de zib.txt).
type NoeudFs =
  | { dossier: true, enfants: Map<string, NoeudFs>, ino: number }
  | { dossier?: false, donnees: Uint8Array, taille: number, synthetique?: number, ino: number }

// Remplissage des fichiers trop gros pour être embarqués (zib.txt, 37 Mo) :
// même nature de contenu que l'original (lorem ipsum), généré à la volée.
const MOTIF_SYNTHETIQUE = new TextEncoder().encode(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc lacinia porta dolor a rhoncus. ',
)

let racineFs: Extract<NoeudFs, { dossier: true }> | undefined
let prochainIno = 1

function nouveauDossier(): Extract<NoeudFs, { dossier: true }> {
  return { dossier: true, enfants: new Map(), ino: prochainIno++ }
}

function normaliser(chemin: string): string[] {
  const segments: string[] = []
  for (const seg of chemin.replace(/\\/g, '/').split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') segments.pop()
    else segments.push(seg)
  }
  return segments
}

function trouver(chemin: string): NoeudFs | undefined {
  let noeud: NoeudFs | undefined = racineFs
  for (const seg of normaliser(chemin)) {
    if (!noeud || !noeud.dossier) return undefined
    noeud = noeud.enfants.get(seg)
  }
  return noeud
}

function creerArborescence(segments: string[]): Extract<NoeudFs, { dossier: true }> {
  let noeud = racineFs!
  for (const seg of segments) {
    let suivant = noeud.enfants.get(seg)
    if (!suivant) {
      suivant = nouveauDossier()
      noeud.enfants.set(seg, suivant)
    }
    if (!suivant.dossier) throw new Error(`pas un dossier : ${seg}`)
    noeud = suivant
  }
  return noeud
}

function decoderB64(b64: string): Uint8Array {
  const brut = atob(b64)
  const octets = new Uint8Array(brut.length)
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i)
  return octets
}

/** Contenu d'un fichier du FS virtuel (ex. un téléchargement du client). */
export function lireFichierVirtuel(chemin: string): Uint8Array | undefined {
  const noeud = trouver(chemin)
  if (!noeud || noeud.dossier) return undefined
  return noeud.donnees.subarray(0, noeud.taille)
}

function lireSynthetique(destination: Uint8Array, position: number, longueur: number): void {
  for (let i = 0; i < longueur; i++)
    destination[i] = MOTIF_SYNTHETIQUE[(position + i) % MOTIF_SYNTHETIQUE.length]!
}

function construireFs(manifeste: ManifesteDemo): void {
  racineFs = nouveauDossier()
  creerArborescence(['data'])
  creerArborescence(['downloads'])
  for (const dossier of manifeste.dossiers) creerArborescence(normaliser(dossier))
  for (const fichier of manifeste.fichiers) {
    const segments = normaliser(fichier.chemin)
    const nom = segments.pop()!
    const parent = creerArborescence(segments)
    if (fichier.synthetique) {
      parent.enfants.set(nom, { donnees: new Uint8Array(0), taille: 0, synthetique: fichier.taille ?? 0, ino: prochainIno++ })
    }
    else {
      const donnees = decoderB64(fichier.b64 ?? '')
      parent.enfants.set(nom, { donnees, taille: donnees.length, ino: prochainIno++ })
    }
  }
  const hidden = decoderB64(manifeste.hiddenFileB64)
  racineFs.enfants.set('hiddenFile.txt', { donnees: hidden, taille: hidden.length, ino: prochainIno++ })
}

// ---------------------------------------------------------------------------
// Shim globalThis.fs/process/path attendu par wasm_exec.js (API Node en
// callbacks). Seule la surface réellement utilisée par syscall/fs_js.go de Go
// est implémentée.
// ---------------------------------------------------------------------------

interface DescripteurOuvert {
  noeud: NoeudFs
  position: number
  append: boolean
}

function erreurFs(code: string): Error & { code: string } {
  const err = new Error(code) as Error & { code: string }
  err.code = code
  return err
}

function statDe(noeud: NoeudFs): Record<string, unknown> {
  const estDossier = noeud.dossier === true
  const taille = estDossier ? 0 : (noeud.synthetique ?? noeud.taille)
  const maintenant = Date.now()
  return {
    dev: 0,
    ino: noeud.ino,
    mode: estDossier ? 0o40777 : 0o100644,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: 0,
    size: taille,
    blksize: 4096,
    blocks: Math.ceil(taille / 512),
    atimeMs: maintenant,
    mtimeMs: maintenant,
    ctimeMs: maintenant,
    isDirectory: () => estDossier,
  }
}

function installerShim(): void {
  const decodeur = new TextDecoder()
  const descripteurs = new Map<number, DescripteurOuvert>()
  let prochainFd = 100
  let tamponSortie = ''

  const ecrireConsole = (tampon: Uint8Array): number => {
    tamponSortie += decodeur.decode(tampon)
    const nl = tamponSortie.lastIndexOf('\n')
    if (nl !== -1) {
      // Logs slog du serveur Go : utiles au débogage, silencieux pour le visiteur.
      console.info(`[ftp-go] ${tamponSortie.substring(0, nl)}`)
      tamponSortie = tamponSortie.substring(nl + 1)
    }
    return tampon.length
  }

  const fs = {
    constants: { O_WRONLY: 1, O_RDWR: 2, O_CREAT: 64, O_EXCL: 128, O_TRUNC: 512, O_APPEND: 1024, O_DIRECTORY: 65536 },

    writeSync(fd: number, tampon: Uint8Array): number {
      return ecrireConsole(tampon)
    },

    open(chemin: string, drapeaux: number, _mode: number, rappel: (err: unknown, fd?: number) => void) {
      const segments = normaliser(chemin)
      const nom = segments[segments.length - 1]
      let noeud = trouver(chemin)
      if (!noeud) {
        if (!(drapeaux & fs.constants.O_CREAT)) return rappel(erreurFs('ENOENT'))
        const parent = trouver(segments.slice(0, -1).join('/'))
        if (!parent || !parent.dossier || nom === undefined) return rappel(erreurFs('ENOENT'))
        noeud = { donnees: new Uint8Array(0), taille: 0, ino: prochainIno++ }
        parent.enfants.set(nom, noeud)
      }
      if ((drapeaux & fs.constants.O_DIRECTORY) && !noeud.dossier) return rappel(erreurFs('ENOTDIR'))
      if (!noeud.dossier && (drapeaux & fs.constants.O_TRUNC)) noeud.taille = 0
      const fd = prochainFd++
      descripteurs.set(fd, { noeud, position: 0, append: (drapeaux & fs.constants.O_APPEND) !== 0 })
      rappel(null, fd)
    },

    close(fd: number, rappel: (err: unknown) => void) {
      descripteurs.delete(fd)
      rappel(null)
    },

    read(
      fd: number,
      tampon: Uint8Array,
      decalage: number,
      longueur: number,
      position: number | null,
      rappel: (err: unknown, lus?: number) => void,
    ) {
      const desc = descripteurs.get(fd)
      if (!desc || desc.noeud.dossier) return rappel(erreurFs('EBADF'))
      const debut = position ?? desc.position
      const taille = desc.noeud.synthetique ?? desc.noeud.taille
      const aLire = Math.max(0, Math.min(longueur, taille - debut))
      if (aLire > 0) {
        const cible = tampon.subarray(decalage, decalage + aLire)
        if (desc.noeud.synthetique !== undefined) lireSynthetique(cible, debut, aLire)
        else cible.set(desc.noeud.donnees.subarray(debut, debut + aLire))
      }
      if (position === null) desc.position = debut + aLire
      rappel(null, aLire)
    },

    write(
      fd: number,
      tampon: Uint8Array,
      decalage: number,
      longueur: number,
      position: number | null,
      rappel: (err: unknown, ecrits?: number) => void,
    ) {
      if (fd === 1 || fd === 2) return rappel(null, ecrireConsole(tampon.subarray(decalage, decalage + longueur)))
      const desc = descripteurs.get(fd)
      if (!desc || desc.noeud.dossier) return rappel(erreurFs('EBADF'))
      const source = tampon.subarray(decalage, decalage + longueur)
      const noeud = desc.noeud
      const debut = desc.append ? noeud.taille : (position ?? desc.position)
      const fin = debut + source.length
      if (fin > noeud.donnees.length) {
        const agrandi = new Uint8Array(Math.max(fin, noeud.donnees.length * 2, 4096))
        agrandi.set(noeud.donnees.subarray(0, noeud.taille))
        noeud.donnees = agrandi
      }
      noeud.donnees.set(source, debut)
      noeud.taille = Math.max(noeud.taille, fin)
      if (position === null) desc.position = fin
      rappel(null, source.length)
    },

    fstat(fd: number, rappel: (err: unknown, stat?: unknown) => void) {
      const desc = descripteurs.get(fd)
      if (!desc) return rappel(erreurFs('EBADF'))
      rappel(null, statDe(desc.noeud))
    },

    stat(chemin: string, rappel: (err: unknown, stat?: unknown) => void) {
      const noeud = trouver(chemin)
      if (!noeud) return rappel(erreurFs('ENOENT'))
      rappel(null, statDe(noeud))
    },

    lstat(chemin: string, rappel: (err: unknown, stat?: unknown) => void) {
      fs.stat(chemin, rappel)
    },

    readdir(chemin: string, rappel: (err: unknown, noms?: string[]) => void) {
      const noeud = trouver(chemin)
      if (!noeud || !noeud.dossier) return rappel(erreurFs('ENOTDIR'))
      rappel(null, [...noeud.enfants.keys()])
    },

    mkdir(chemin: string, _perm: number, rappel: (err: unknown) => void) {
      try {
        creerArborescence(normaliser(chemin))
        rappel(null)
      }
      catch {
        rappel(erreurFs('ENOTDIR'))
      }
    },

    unlink(chemin: string, rappel: (err: unknown) => void) {
      const segments = normaliser(chemin)
      const parent = trouver(segments.slice(0, -1).join('/'))
      const nom = segments[segments.length - 1]
      if (!parent || !parent.dossier || nom === undefined || !parent.enfants.delete(nom))
        return rappel(erreurFs('ENOENT'))
      rappel(null)
    },

    fsync(_fd: number, rappel: (err: unknown) => void) { rappel(null) },
    chmod(_chemin: string, _mode: number, rappel: (err: unknown) => void) { rappel(null) },
    fchmod(_fd: number, _mode: number, rappel: (err: unknown) => void) { rappel(null) },

    rename(_de: string, _vers: string, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    rmdir(_chemin: string, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    truncate(_chemin: string, _l: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    ftruncate(_fd: number, _l: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    readlink(_chemin: string, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    link(_a: string, _b: string, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    symlink(_a: string, _b: string, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    chown(_c: string, _u: number, _g: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    fchown(_f: number, _u: number, _g: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    lchown(_c: string, _u: number, _g: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
    utimes(_c: string, _a: number, _m: number, rappel: (err: unknown) => void) { rappel(erreurFs('ENOSYS')) },
  }

  const globalQuelconque = globalThis as Record<string, unknown>
  globalQuelconque.fs = fs
  globalQuelconque.process = {
    getuid: () => -1,
    getgid: () => -1,
    geteuid: () => -1,
    getegid: () => -1,
    getgroups: () => { throw erreurFs('ENOSYS') },
    pid: -1,
    ppid: -1,
    umask: () => { throw erreurFs('ENOSYS') },
    cwd: () => '/',
    chdir: () => { throw erreurFs('ENOSYS') },
  }
  globalQuelconque.path = {
    resolve: (...segments: string[]) => `/${normaliser(segments.join('/')).join('/')}`,
  }
}

// ---------------------------------------------------------------------------
// Chargement et pilotage du binaire wasm.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Go?: new () => { importObject: WebAssembly.Imports, run: (instance: WebAssembly.Instance) => Promise<void> }
    __ftpgo?: PontFtp
  }
}

function chargerScript(url: string): Promise<void> {
  return new Promise((resoudre, rejeter) => {
    if (window.Go) return resoudre()
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resoudre()
    script.onerror = () => rejeter(new Error(`échec du chargement de ${url}`))
    document.head.appendChild(script)
  })
}

/** Charge le manifeste + le binaire wasm, démarre le serveur Go. Idempotent. */
export async function demarrerFtpWasm(base: string): Promise<PontFtp> {
  if (window.__ftpgo?.ready) return window.__ftpgo

  const reponseManifeste = await fetch(`${base}demos/ftp/data.json`)
  if (!reponseManifeste.ok) throw new Error('manifeste introuvable')
  construireFs(await reponseManifeste.json() as ManifesteDemo)
  installerShim()

  await chargerScript(`${base}demos/ftp/wasm_exec.js`)
  const go = new window.Go!()
  const reponseWasm = await fetch(`${base}demos/ftp/ftp.wasm`)
  if (!reponseWasm.ok) throw new Error('binaire wasm introuvable')
  const { instance } = await WebAssembly.instantiate(await reponseWasm.arrayBuffer(), go.importObject)
  void go.run(instance)

  for (let essai = 0; essai < 100; essai++) {
    if (window.__ftpgo?.ready) return window.__ftpgo
    await new Promise(r => setTimeout(r, 50))
  }
  throw new Error('le pont wasm ne répond pas')
}

// Le serveur Go et le pont __ftpgo sont des singletons de page. Une génération
// monotone garantit qu'une seule session est « active » : les callbacks d'une
// session superseded (composant démonté, reconnexion en cours, instance
// résiduelle d'un rechargement HMR) sont ignorés, ce qui évite les boucles de
// End/reconnexion entre plusieurs souscriptions au même pont.
let generationActive = 0

/** Ouvre une session client sur le serveur embarqué (3333 client, 4444 admin). */
export function connecterFtpWasm(pont: PontFtp, evenements: EvenementsFtp, port = '3333'): void {
  const generation = ++generationActive
  pont.connect((type: string, ...args: unknown[]) => {
    if (generation !== generationActive) return
    switch (type) {
      case 'log': evenements.log(String(args[0]), String(args[1])); break
      case 'cwd': evenements.cwd(String(args[0])); break
      case 'progress': evenements.progress(String(args[0]), Number(args[1])); break
      case 'progressEnd': evenements.progressEnd(String(args[0])); break
      case 'quit': evenements.quit(); break
      case 'fatal': evenements.fatal(String(args[0]), String(args[1] ?? '')); break
    }
  }, port)
}

/** Invalide la session courante (démontage) : ses callbacks deviennent muets. */
export function deconnecterFtpWasm(): void {
  generationActive++
}
