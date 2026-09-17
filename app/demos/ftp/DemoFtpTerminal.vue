<script setup lang="ts">
import type { EntreesDossier } from '~/demos/ftp/completion'
import type { EtatDemo, Telechargement } from '~/demos/ftp/simulation'
import { COMMANDES_ADMIN, COMMANDES_CLIENT, COMMANDES_SIMULATION, completer } from '~/demos/ftp/completion'
import { commandeFichier, filAriane, remonteesVers } from '~/demos/ftp/explorateur'
import { SEUIL_GROS_FICHIER, creerEtat, entreesPourCompletion, executerCommande, formatTaille, invite } from '~/demos/ftp/simulation'
import { connecterFtpWasm, deconnecterFtpWasm, demarrerFtpWasm, lireFichierVirtuel, listerDossierVirtuel, listerMasquesVirtuels } from '~/demos/ftp/wasm'

const props = defineProps<{ ouvert: boolean }>()
const emit = defineEmits<{ 'update:ouvert': [valeur: boolean] }>()

// `dialogue` vient de useModale, plus bas.
const sortie = ref<HTMLElement>()
const champ = ref<HTMLInputElement>()

const lignes = ref<{ texte: string, classe?: string }[]>([])
const saisie = ref('')
const connecte = ref(false)
const chargement = ref(false)
/** Avancement du téléchargement du binaire, `null` si la taille est inconnue. */
const progression = ref<number | null>(null)
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
// Complétion Tab : commandes, puis contenu du dossier courant.
// ------------------------------------------------------------------

/**
 * Contenu du dossier courant vu par le serveur. En mode réel il est lu dans le
 * FS virtuel que pilote le binaire Go, donc il suit les Hide et Reveal déjà
 * passés dans la session.
 */
function entreesDuDossier(): EntreesDossier {
  if (mode.value === 'simulation') return entreesPourCompletion(etatSimulation)

  // Le serveur exprime son dossier courant relativement à data/ (vide à la
  // racine, puis « /important ») alors que le FS virtuel le monte sous /data.
  const relatif = cheminCourant.value
  const { dossiers, fichiers } = listerDossierVirtuel(`/data${relatif}`)
  // hiddenFile.txt emploie la même origine : on ne retient que les entrées
  // directes du dossier courant.
  const prefixe = `${relatif}/`
  const masques = listerMasquesVirtuels()
    .filter(chemin => chemin.startsWith(prefixe))
    .map(chemin => chemin.slice(prefixe.length))
    .filter(nom => nom !== '' && !nom.includes('/'))

  const visible = (nom: string) => !masques.includes(nom)
  return { dossiers: dossiers.filter(visible), fichiers: fichiers.filter(visible), masques }
}

function commandesDisponibles(): readonly string[] {
  if (mode.value === 'simulation') return COMMANDES_SIMULATION
  return port.value === '4444' ? COMMANDES_ADMIN : COMMANDES_CLIENT
}

// Tab reste la touche de navigation clavier : on ne la détourne que dans une
// session ouverte, et jamais combinée à Maj — sinon on ne pourrait plus sortir
// du champ pour atteindre les boutons de la fenêtre.
function completerSaisie(evenement: KeyboardEvent) {
  if (chargement.value || !connecte.value) return
  evenement.preventDefault()

  const { saisie: complete, candidats } = completer(saisie.value, entreesDuDossier(), commandesDisponibles())
  saisie.value = complete
  // Comme un shell : la liste n'apparaît qu'au Tab qui n'ajoute plus rien.
  if (candidats.length > 0) ecrire(candidats.join('  '))
}

// ------------------------------------------------------------------
// Explorateur : le dossier courant, cliquable. Rend la démo utilisable sans
// rien taper (un visiteur non technique explore et télécharge à la souris),
// et montre visuellement l'effet des commandes tapées, y compris Hide/Reveal.
// ------------------------------------------------------------------

// Le FS virtuel n'est pas réactif : ce compteur, incrémenté après chaque
// commande et à chaque réponse du serveur, force la relecture du dossier.
const versionFs = ref(0)
function rafraichirFs() {
  versionFs.value++
}

const entreesAffichees = computed<EntreesDossier>(() => {
  // Dépendances réactives explicites : relecture après commande, changement de
  // dossier, de port ou de mode.
  void versionFs.value
  void cheminCourant.value
  void port.value
  if (!connecte.value || chargement.value) return { dossiers: [], fichiers: [], masques: [] }
  return entreesDuDossier()
})

const estRacine = computed(() => cheminCourant.value === '')
const filDAriane = computed(() => filAriane(cheminCourant.value))

function refocus() {
  champ.value?.focus()
}
function ouvrirDossier(nom: string) {
  lancerCommande(`Cd ${nom}`)
  refocus()
}
function remonter() {
  lancerCommande('Cd ..')
  refocus()
}
/** Remonte jusqu'au segment cliqué du fil d'Ariane (Cd .. répétés). */
function remonterVers(index: number) {
  const remontees = remonteesVers(filDAriane.value, index)
  for (let i = 0; i < remontees; i++) lancerCommande('Cd ..')
  refocus()
}
/** Clic sur un fichier : télécharger (port client) ou masquer (port admin). */
function actionnerFichier(nom: string) {
  lancerCommande(commandeFichier(nom, port.value === '4444' && mode.value === 'reel'))
  refocus()
}
function revelerFichier(nom: string) {
  lancerCommande(`Reveal ${nom}`)
  refocus()
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
  ecrire('Tab complète la commande ou le nom de fichier, ↑ et ↓ rappellent l\'historique.', 'terminal__ligne--sys')
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
      // Le serveur a répondu : le FS a pu changer (Hide/Reveal). On relit.
      rafraichirFs()
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
    // La ligne est réécrite à chaque morceau reçu plutôt que dupliquée : le
    // terminal afficherait sinon des centaines de lignes de progression.
    const ligneChargement = lignes.value.length - 1
    await demarrerFtpWasm(baseURL, (fraction, recus, total) => {
      progression.value = fraction
      // Virgule décimale : « 4.2 Mo » jurait à côté du « 4,4 Mo » annoncé.
      const mo = (octets: number) => (octets / 1048576).toFixed(1).replace('.', ',')
      const ligne = lignes.value[ligneChargement]
      if (!ligne) return
      // Le gabarit d'annonce est conservé : réécrire la ligne entière ferait
      // perdre la taille de référence, seul repère quand elle est indéterminée.
      ligne.texte = fraction === null
        ? `Chargement du binaire Go (4,4 Mo, WebAssembly)… ${mo(recus)} Mo`
        : `Chargement du binaire Go (WebAssembly)… ${Math.round(fraction * 100)} % (${mo(recus)} / ${mo(total!)} Mo)`
    })
    progression.value = null
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

/**
 * Exécute une commande déjà connue (saisie validée, clic dans l'explorateur ou
 * le fil d'Ariane). Suppose une session ouverte.
 */
function lancerCommande(commande: string) {
  if (chargement.value || !connecte.value || !commande.trim()) return
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
    void executerSimulation(commande).then(rafraichirFs)
  }
}

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
  lancerCommande(commande)
}

function fermer() {
  emit('update:ouvert', false)
}

const { dialogue, attributs } = useModale({
  ouverte: () => props.ouvert,
  fermer,
  surOuverture: () => void ouvrir(),
  // Un clic à côté fermerait la session en cours : le binaire wasm serait à
  // retélécharger et l'arborescence explorée, perdue.
  fermerAuClicExterieur: false,
})

async function ouvrir() {
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

// La fenêtre elle-même est pilotée par useModale ; il ne reste ici que la
// session à couper.
watch(() => props.ouvert, (ouvert) => {
  if (!ouvert) nettoyer()
})

onBeforeUnmount(nettoyer)
</script>

<template>
  <dialog ref="dialogue" class="terminal" aria-label="Démo interactive du client FTP" v-bind="attributs">
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

    <!-- Une ligne de texte ne suffisait pas : sur une connexion mobile, rien
         ne distinguait un téléchargement lent d'un blocage. La barre est
         indéterminée quand le serveur n'annonce pas la taille. -->
    <div
      v-if="chargement"
      class="terminal__progression"
      role="progressbar"
      aria-label="Chargement du binaire WebAssembly"
      :aria-valuenow="progression === null ? undefined : Math.round(progression * 100)"
      :aria-valuemin="progression === null ? undefined : 0"
      :aria-valuemax="progression === null ? undefined : 100"
    >
      <div
        class="terminal__progression-barre"
        :class="{ 'terminal__progression-barre--indeterminee': progression === null }"
        :style="progression === null ? undefined : { width: `${progression * 100}%` }"
      />
    </div>

    <div class="terminal__corps" :class="{ 'terminal__corps--avec-explorateur': connecte && !chargement }">
      <!-- Explorateur : le dossier courant, cliquable. Un visiteur explore et
           télécharge à la souris ; les commandes tapées s'y reflètent aussi. -->
      <aside v-if="connecte && !chargement" class="explorateur" aria-label="Explorateur de fichiers">
        <nav class="explorateur__fil" aria-label="Chemin">
          <button
            v-for="(seg, i) in filDAriane"
            :key="i"
            type="button"
            class="explorateur__segment"
            :disabled="i === filDAriane.length - 1"
            @click="remonterVers(i)"
          >{{ seg }}</button>
        </nav>

        <ul class="explorateur__liste">
          <li v-if="!estRacine">
            <button type="button" class="explorateur__entree explorateur__entree--dossier" @click="remonter">
              <span class="explorateur__icone" aria-hidden="true">↩</span>
              <span class="explorateur__nom">..</span>
            </button>
          </li>
          <li v-for="d in entreesAffichees.dossiers" :key="`d-${d}`">
            <button type="button" class="explorateur__entree explorateur__entree--dossier" @click="ouvrirDossier(d)">
              <span class="explorateur__icone" aria-hidden="true">▸</span>
              <span class="explorateur__nom">{{ d }}</span>
            </button>
          </li>
          <li v-for="f in entreesAffichees.fichiers" :key="`f-${f}`">
            <button
              type="button"
              class="explorateur__entree"
              :title="port === '4444' && mode === 'reel' ? `Masquer ${f}` : `Télécharger ${f}`"
              @click="actionnerFichier(f)"
            >
              <span class="explorateur__icone" aria-hidden="true">▪</span>
              <span class="explorateur__nom">{{ f }}</span>
              <span class="explorateur__action" aria-hidden="true">{{ port === '4444' && mode === 'reel' ? 'Hide' : '↓' }}</span>
            </button>
          </li>
          <li v-for="m in (port === '4444' && mode === 'reel' ? entreesAffichees.masques : [])" :key="`m-${m}`">
            <button type="button" class="explorateur__entree explorateur__entree--masque" :title="`Révéler ${m}`" @click="revelerFichier(m)">
              <span class="explorateur__icone" aria-hidden="true">▫</span>
              <span class="explorateur__nom">{{ m }}</span>
              <span class="explorateur__action" aria-hidden="true">Reveal</span>
            </button>
          </li>
        </ul>

        <p class="explorateur__aide">
          {{ port === '4444' && mode === 'reel' ? 'Admin — clic : masquer / révéler' : 'Dossier : ouvrir · fichier : télécharger' }}
        </p>
      </aside>

      <div class="terminal__main">
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
            @keydown.tab.exact="completerSaisie"
          >
        </form>
      </div>
    </div>

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
  width: min(900px, 96vw);
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
  gap: var(--esp-3);
  flex-wrap: wrap;
  padding: var(--esp-3) var(--esp-4);
  border-bottom: 1px solid rgba(226, 233, 241, 0.12);
}
.terminal__titre {
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: #8fb4d8;
}
.terminal__ports { display: flex; gap: var(--esp-2); }
.terminal__port {
  border: 1px solid rgba(143, 180, 216, 0.35);
  background: none;
  color: #8fb4d8;
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  border-radius: var(--radius-sm);
  padding: var(--esp-1) var(--esp-2);
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
  font-size: var(--txt-base);
  cursor: pointer;
  padding: var(--esp-1) var(--esp-2);
}
.terminal__fermer:hover { color: #fff; }

.terminal__progression {
  height: 2px;
  background: rgba(143, 180, 216, 0.18);
  overflow: hidden;
}
.terminal__progression-barre {
  height: 100%;
  width: 0;
  background: #8fb4d8;
  transition: width var(--duree-rapide) linear;
}
/* Taille inconnue : un va-et-vient plutôt qu'une largeur mensongère. */
.terminal__progression-barre--indeterminee {
  width: 35%;
  animation: va-et-vient 1.1s ease-in-out infinite;
}
@keyframes va-et-vient {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(340%); }
}
@media (prefers-reduced-motion: reduce) {
  .terminal__progression-barre--indeterminee { animation: none; width: 100%; opacity: 0.5; }
}
/* Corps : explorateur (optionnel) + terminal. Une seule colonne quand
   l'explorateur est absent, pour ne pas laisser de gouttière vide. */
.terminal__corps {
  display: grid;
  grid-template-columns: 1fr;
}
.terminal__corps--avec-explorateur {
  grid-template-columns: minmax(0, 190px) minmax(0, 1fr);
}
.terminal__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ---- Explorateur ---- */
.explorateur {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1px solid rgba(226, 233, 241, 0.12);
  background: rgba(143, 180, 216, 0.04);
}
.explorateur__fil {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.1rem;
  padding: var(--esp-2) var(--esp-3);
  border-bottom: 1px solid rgba(226, 233, 241, 0.1);
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
}
.explorateur__segment {
  border: none;
  background: none;
  color: #8fb4d8;
  font: inherit;
  padding: 0;
  cursor: pointer;
}
.explorateur__segment:disabled { color: #d7e2ec; cursor: default; }
.explorateur__segment:not(:last-child)::after { content: '/'; color: rgba(215, 226, 236, 0.4); margin: 0 0.1rem; }
.explorateur__segment:not(:disabled):hover { text-decoration: underline; }
.explorateur__liste {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: var(--esp-1) 0;
}
.explorateur__entree {
  display: flex;
  align-items: center;
  gap: var(--esp-2);
  width: 100%;
  border: none;
  background: none;
  color: #c9d6e5;
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-align: left;
  padding: 0.28rem var(--esp-3);
  cursor: pointer;
}
.explorateur__entree:hover { background: rgba(143, 180, 216, 0.12); color: #fff; }
.explorateur__icone { color: #8fb4d8; flex-shrink: 0; }
.explorateur__entree--dossier .explorateur__icone { color: #f6a96e; }
.explorateur__nom { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.explorateur__action { flex-shrink: 0; color: rgba(215, 226, 236, 0.4); }
.explorateur__entree:hover .explorateur__action { color: #7ee0a3; }
.explorateur__entree--masque { color: rgba(215, 226, 236, 0.4); font-style: italic; }
.explorateur__aide {
  margin: 0;
  padding: var(--esp-2) var(--esp-3);
  border-top: 1px solid rgba(226, 233, 241, 0.1);
  font-size: var(--txt-2xs);
  color: rgba(215, 226, 236, 0.45);
  line-height: 1.4;
}
/* Sur mobile, l'explorateur passe au-dessus du terminal, hauteur limitée. */
@media (max-width: 640px) {
  .terminal__corps--avec-explorateur { grid-template-columns: 1fr; }
  .explorateur { border-right: none; border-bottom: 1px solid rgba(226, 233, 241, 0.12); }
  .explorateur__liste { max-height: 120px; }
}

.terminal__sortie {
  height: min(46vh, 380px);
  overflow-y: auto;
  padding: var(--esp-4) var(--esp-4);
  cursor: text;
}
.terminal__ligne {
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
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
  gap: var(--esp-2);
  align-items: center;
  padding: var(--esp-2) var(--esp-4);
  border-top: 1px solid rgba(226, 233, 241, 0.12);
}
.terminal__prompt {
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: #7ee0a3;
  white-space: nowrap;
}
.terminal__champ {
  flex: 1;
  border: none;
  background: none;
  color: inherit;
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  outline: none;
}
.terminal__champ::placeholder { color: rgba(215, 226, 236, 0.35); }
.terminal__note {
  margin: 0;
  padding: var(--esp-2) var(--esp-4) var(--esp-3);
  font-size: var(--txt-2xs);
  color: rgba(215, 226, 236, 0.55);
}
.terminal__note a { color: #8fb4d8; }
</style>
