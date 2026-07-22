<script setup lang="ts">
import type { EtatDemo, Telechargement } from '~/demos/ftp/simulation'
import { SEUIL_GROS_FICHIER, creerEtat, executerCommande, formatTaille, invite } from '~/demos/ftp/simulation'
import { connecterFtpWasm, deconnecterFtpWasm, demarrerFtpWasm, lireFichierVirtuel } from '~/demos/ftp/wasm'

const props = defineProps<{ ouvert: boolean }>()
const emit = defineEmits<{ 'update:ouvert': [valeur: boolean] }>()

const dialogue = ref<HTMLDialogElement>()
const sortie = ref<HTMLElement>()
const champ = ref<HTMLInputElement>()

const lignes = ref<{ texte: string, classe?: string }[]>([])
const saisie = ref('')
const connecte = ref(false)
const chargement = ref(false)
// 'reel' : le vrai client/serveur Go tournent en WebAssembly.
// 'simulation' : repli TypeScript si le wasm ne charge pas.
const mode = ref<'reel' | 'simulation'>('reel')
const cheminCourant = ref('')

const baseURL = useRuntimeConfig().app.baseURL

function ecrire(texte: string, classe?: string) {
  lignes.value.push({ texte, classe })
  defiler()
}

async function defiler() {
  await nextTick()
  sortie.value?.scrollTo({ top: sortie.value.scrollHeight })
}

function classePourOrigine(origine: string): string {
  if (origine === 'Usr') return 'terminal__ligne--usr'
  if (origine === 'Srv') return 'terminal__ligne--srv'
  return 'terminal__ligne--sys'
}

function livrerFichier(nom: string, contenu: Uint8Array | string) {
  // slice() recopie vers un ArrayBuffer non partagé, seul type accepté par Blob.
  const url = URL.createObjectURL(new Blob([typeof contenu === 'string' ? contenu : contenu.slice()]))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  lien.click()
  URL.revokeObjectURL(url)
}

// ------------------------------------------------------------------
// Historique de saisie : réplique de la TUI native
// (internal/app/client/view/cmd/model.go) — ↑/↓, sauvegarde de la saisie en
// cours, pas de doublons consécutifs.
// ------------------------------------------------------------------

const historique: string[] = []
let indexHistorique = -1
let saisieSauvegardee = ''

function memoriser(commande: string) {
  indexHistorique = -1
  if (historique.length === 0 || historique[historique.length - 1] !== commande)
    historique.push(commande)
}

function historiquePrecedent() {
  if (historique.length === 0) return
  if (indexHistorique === -1) {
    saisieSauvegardee = saisie.value
    indexHistorique = historique.length - 1
  }
  else if (indexHistorique > 0) {
    indexHistorique -= 1
  }
  saisie.value = historique[indexHistorique]!
}

function historiqueSuivant() {
  if (historique.length === 0 || indexHistorique === -1) return
  if (indexHistorique === historique.length - 1) {
    indexHistorique = -1
    saisie.value = saisieSauvegardee
    return
  }
  indexHistorique += 1
  saisie.value = historique[indexHistorique]!
}

// ------------------------------------------------------------------
// Mode réel : pilotage du binaire wasm compilé depuis Nielsplu/ftp-go.
// ------------------------------------------------------------------

// Port du serveur embarqué, comme le flag -p du client natif : 3333 expose
// List/Cd/Get, 4444 (admin) expose List/Cd/Hide/Reveal/Terminate.
const port = ref<'3333' | '4444'>('3333')
let reconnexionAuto = false

// Barres de progression du vrai client : nom de fichier -> index de ligne.
const barres = new Map<string, number>()

function rendreBarre(pourcent: number): string {
  const pleins = Math.round(Math.min(1, pourcent) * 24)
  return `[${'#'.repeat(pleins)}${'-'.repeat(24 - pleins)}] ${Math.round(Math.min(1, pourcent) * 100)} %`
}

function basculerPort(nouveau: '3333' | '4444') {
  if (port.value === nouveau || mode.value !== 'reel' || chargement.value) return
  port.value = nouveau
  if (connecte.value) {
    // On ferme proprement la session en cours, la reconnexion sur le nouveau
    // port se fait à la réception du quit du vrai client.
    reconnexionAuto = true
    window.__ftpgo?.send('End')
  }
  else {
    connecterReel()
  }
}

function aideReelle() {
  const communes = ['  List              liste le dossier courant', '  Cd <dossier>      change de dossier (Cd .. pour remonter)', '  End               ferme la session']
  ecrire('Commandes du serveur sur ce port :', 'terminal__ligne--sys')
  if (port.value === '3333') {
    for (const l of [...communes.slice(0, 2), '  Get <fichier>     télécharge un fichier (chunks au-delà de 1 Mio)', communes[2]!]) ecrire(l)
    ecrire('Port admin (4444) : Hide, Reveal, Terminate.', 'terminal__ligne--sys')
  }
  else {
    for (const l of [...communes.slice(0, 2), '  Hide <fichier>    masque un fichier côté serveur', '  Reveal <fichier>  ré-affiche un fichier masqué', '  Terminate         arrêt gracieux du serveur (Stoppers)', communes[2]!]) ecrire(l)
    ecrire('Port client (3333) : Get.', 'terminal__ligne--sys')
  }
}

function connecterReel() {
  const pont = window.__ftpgo
  if (!pont?.ready || connecte.value) return
  connecte.value = true
  barres.clear()
  connecterFtpWasm(pont, {
    log(origine, contenu) {
      ecrire(`[${origine}] ${contenu}`, classePourOrigine(origine))
      // Message émis par le vrai client à la fin d'un Get : on récupère le
      // fichier écrit dans downloads/ (FS virtuel) pour le navigateur.
      const fini = contenu.match(/^File transfer finished : (.+)$/)
      if (fini?.[1]) {
        const nom = fini[1].split('/').pop() ?? fini[1]
        const donnees = lireFichierVirtuel(`/downloads/${nom}`)
        if (donnees) livrerFichier(nom, donnees)
      }
    },
    cwd(vers) {
      cheminCourant.value = vers
    },
    progress(nom, pourcent) {
      const index = barres.get(nom)
      const texte = `${nom.split('/').pop()} ${rendreBarre(pourcent)}`
      if (index === undefined) {
        barres.set(nom, lignes.value.length)
        ecrire(texte, 'terminal__ligne--sys')
      }
      else {
        lignes.value[index] = { texte, classe: 'terminal__ligne--sys' }
      }
    },
    progressEnd(nom) {
      const index = barres.get(nom)
      if (index !== undefined)
        lignes.value[index] = { texte: `${nom.split('/').pop()} ${rendreBarre(1)}`, classe: 'terminal__ligne--sys' }
      barres.delete(nom)
    },
    quit() {
      connecte.value = false
      cheminCourant.value = ''
      if (reconnexionAuto) {
        reconnexionAuto = false
        setTimeout(connecterReel, 150)
        return
      }
      ecrire('Session fermée. Appuyez sur Entrée pour vous reconnecter.', 'terminal__ligne--sys')
    },
    fatal(message, details) {
      connecte.value = false
      cheminCourant.value = ''
      ecrire(`[Sys] ${message}${details ? ` (${details})` : ''}`, 'terminal__ligne--sys')
      if (reconnexionAuto) {
        reconnexionAuto = false
        setTimeout(connecterReel, 150)
        return
      }
      ecrire('Appuyez sur Entrée pour vous reconnecter.', 'terminal__ligne--sys')
    },
  }, port.value)
}

async function ouvrirSession() {
  chargement.value = true
  try {
    ecrire('Chargement du binaire Go (4,4 Mo, WebAssembly)…', 'terminal__ligne--sys')
    await demarrerFtpWasm(baseURL)
    mode.value = 'reel'
    ecrire('Serveur FTP démarré dans la page — code réel de Nielsplu/ftp-go.', 'terminal__ligne--sys')
    ecrire('Tapez "help" pour la liste des commandes.', 'terminal__ligne--sys')
    connecterReel()
  }
  catch (erreur) {
    mode.value = 'simulation'
    console.warn('démo FTP : repli sur la simulation', erreur)
    ecrire('WebAssembly indisponible : démo simulée.', 'terminal__ligne--sys')
    ecrire('Tapez "help" pour la liste des commandes.', 'terminal__ligne--sys')
    connecterSimulation()
  }
  finally {
    chargement.value = false
  }
}

// ------------------------------------------------------------------
// Mode simulation (repli) : moteur TypeScript de ~/demos/ftp/simulation.
// ------------------------------------------------------------------

let etatSimulation: EtatDemo = creerEtat()

function connecterSimulation() {
  etatSimulation = creerEtat()
  connecte.value = true
}

async function telechargerSimulation({ nom, taille, contenu }: Telechargement) {
  if (taille <= SEUIL_GROS_FICHIER) {
    ecrire(`Réception de ${nom} (${formatTaille(taille)})… ok`)
    livrerFichier(nom, contenu ?? `Contenu de démonstration du fichier ${nom}.\n`)
    return
  }
  const chunks = Math.ceil(taille / (1 << 20))
  ecrire(`Fichier volumineux : envoi en ${chunks} chunks de 1 Mio…`)
  const indexBarre = lignes.value.length
  lignes.value.push({ texte: '' })
  const debut = Date.now()
  let chunk = 0
  while (chunk < chunks) {
    chunk = Math.min(chunks, Math.max(chunk + 1, Math.round(((Date.now() - debut) / 1200) * chunks)))
    lignes.value[indexBarre] = { texte: `${rendreBarre(chunk / chunks)} — chunk ${chunk}/${chunks}` }
    if (chunk % 5 === 0 || chunk === chunks) await defiler()
    if (chunk < chunks) await new Promise(r => setTimeout(r, 30))
  }
  ecrire(`Réception de ${nom} (${formatTaille(taille)})… ok`)
  livrerFichier(nom, `Contenu de démonstration du fichier ${nom}.\n`.repeat(20000))
}

async function executerSimulation(commande: string) {
  ecrire(`${invite(etatSimulation)} $ ${commande}`, 'terminal__ligne--usr')
  const resultat = executerCommande(etatSimulation, commande)
  for (const ligne of resultat.lignes) ecrire(ligne)
  if (resultat.deconnexion) {
    connecte.value = false
    ecrire('Appuyez sur Entrée pour vous reconnecter.', 'terminal__ligne--sys')
  }
  if (resultat.telechargement) await telechargerSimulation(resultat.telechargement)
}

// ------------------------------------------------------------------

function soumettre() {
  if (chargement.value) return
  const commande = saisie.value
  saisie.value = ''

  if (!connecte.value) {
    if (mode.value === 'reel') connecterReel()
    else {
      connecterSimulation()
      ecrire('Reconnecté.', 'terminal__ligne--sys')
    }
    return
  }
  if (!commande.trim()) return
  memoriser(commande)

  if (mode.value === 'reel') {
    // L'aide est un souci de vue (comme la TUI native qui affiche ses
    // commandes) : on ne l'envoie pas au serveur.
    if (commande.trim().toLowerCase() === 'help') {
      ecrire(`[Usr] ${commande}`, 'terminal__ligne--usr')
      aideReelle()
      return
    }
    window.__ftpgo?.send(commande)
  }
  else {
    void executerSimulation(commande)
  }
}

function fermer() {
  emit('update:ouvert', false)
}

async function ouvrir() {
  dialogue.value?.showModal()
  lignes.value = []
  cheminCourant.value = ''
  await ouvrirSession()
  await nextTick()
  champ.value?.focus()
}

function nettoyer() {
  // Ferme proprement la session côté serveur (sinon son timer d'inactivité
  // de 60 s tournerait pour rien en arrière-plan), et coupe le son des
  // callbacks de cette session avant tout futur remontage.
  reconnexionAuto = false
  if (mode.value === 'reel') {
    if (connecte.value) window.__ftpgo?.send('End')
    deconnecterFtpWasm()
  }
  connecte.value = false
}

watch(() => props.ouvert, (ouvert) => {
  if (ouvert) {
    void ouvrir()
  }
  else {
    nettoyer()
    dialogue.value?.close()
  }
})

onMounted(() => {
  // Monté à la demande par le registre des démos, souvent avec ouvert déjà à
  // true : le watch seul ne suffirait pas.
  if (props.ouvert) void ouvrir()
})

onBeforeUnmount(nettoyer)
</script>

<template>
  <dialog ref="dialogue" class="terminal" aria-label="Démo interactive du client FTP" @close="fermer">
    <div class="terminal__barre">
      <span class="terminal__titre">ftp-client — {{ mode === 'reel' ? 'vrai binaire Go en WebAssembly' : 'démo simulée' }}</span>
      <span v-if="mode === 'reel'" class="terminal__ports" role="group" aria-label="Port du serveur">
        <button
          class="terminal__port"
          :class="{ 'terminal__port--actif': port === '3333' }"
          title="List, Cd, Get"
          @click="basculerPort('3333')"
        >-p 3333</button>
        <button
          class="terminal__port"
          :class="{ 'terminal__port--actif': port === '4444' }"
          title="List, Cd, Hide, Reveal, Terminate"
          @click="basculerPort('4444')"
        >-p 4444 (admin)</button>
      </span>
      <button class="terminal__fermer" aria-label="Fermer la démo" @click="fermer">✕</button>
    </div>

    <div ref="sortie" class="terminal__sortie" @click="champ?.focus()">
      <p v-for="(l, i) in lignes" :key="i" class="terminal__ligne" :class="l.classe">{{ l.texte }}</p>
    </div>

    <form class="terminal__invite" @submit.prevent="soumettre">
      <!-- Prompt identique à la TUI native : "<chemin>/ $ " -->
      <label class="terminal__prompt" for="demo-ftp-champ">{{ connecte && mode === 'reel' ? `${cheminCourant}/ $` : '$' }}</label>
      <input
        id="demo-ftp-champ"
        ref="champ"
        v-model="saisie"
        class="terminal__champ"
        type="text"
        autocomplete="off"
        spellcheck="false"
        maxlength="156"
        :placeholder="connecte ? 'Entrez une commande' : 'Entrée pour se reconnecter'"
        @keydown.up.prevent="historiquePrecedent"
        @keydown.down.prevent="historiqueSuivant"
      >
    </form>

    <p class="terminal__note">
      <template v-if="mode === 'reel'">
        Le vrai serveur et le vrai client Go de ce projet tournent dans votre navigateur
        (WebAssembly), reliés par un réseau TCP en mémoire —
      </template>
      <template v-else>
        Protocole simulé pour la démo —
      </template>
      <a href="https://github.com/Nielsplu/ftp-go" target="_blank" rel="noopener">code source</a> ·
      <a href="https://github.com/Nielsplu/ftp-go/releases/tag/v1.0" target="_blank" rel="noopener">binaires</a>
    </p>
  </dialog>
</template>

<style scoped>
.terminal {
  width: min(720px, 94vw);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0;
  background: #101822;
  color: #d7e2ec;
  box-shadow: var(--shadow);
}
.terminal::backdrop { background: rgba(22, 32, 43, 0.55); }
.terminal__barre {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(226, 233, 241, 0.12);
}
.terminal__titre {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8fb4d8;
}
.terminal__ports { display: flex; gap: 0.4rem; }
.terminal__port {
  border: 1px solid rgba(143, 180, 216, 0.35);
  background: none;
  color: #8fb4d8;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.55rem;
  cursor: pointer;
}
.terminal__port--actif {
  background: rgba(143, 180, 216, 0.18);
  color: #d7e2ec;
  border-color: #8fb4d8;
}
.terminal__fermer {
  border: none;
  background: none;
  color: #8fb4d8;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}
.terminal__fermer:hover { color: #fff; }
.terminal__sortie {
  height: min(46vh, 380px);
  overflow-y: auto;
  padding: 0.9rem 1rem;
  cursor: text;
}
.terminal__ligne {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.55;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.terminal__ligne--usr { color: #c2d2ff; }
.terminal__ligne--sys { color: #f38080; }
.terminal__ligne--srv { color: #f6a96e; }
.terminal__invite {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.55rem 1rem;
  border-top: 1px solid rgba(226, 233, 241, 0.12);
}
.terminal__prompt {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: #7ee0a3;
  white-space: nowrap;
}
.terminal__champ {
  flex: 1;
  border: none;
  background: none;
  color: inherit;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  outline: none;
}
.terminal__champ::placeholder { color: rgba(215, 226, 236, 0.35); }
.terminal__note {
  margin: 0;
  padding: 0.55rem 1rem 0.7rem;
  font-size: 0.74rem;
  color: rgba(215, 226, 236, 0.55);
}
.terminal__note a { color: #8fb4d8; }
</style>
