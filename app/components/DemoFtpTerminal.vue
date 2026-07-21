<script setup lang="ts">
import type { EtatDemo, Telechargement } from '~/utils/demoFtp'
import { SEUIL_GROS_FICHIER, creerEtat, executerCommande, formatTaille, invite } from '~/utils/demoFtp'

const props = defineProps<{ ouvert: boolean }>()
const emit = defineEmits<{ 'update:ouvert': [valeur: boolean] }>()

const DELAI_INACTIVITE = 60_000
const TAILLE_CHUNK = 1 << 20

const dialogue = ref<HTMLDialogElement>()
const sortie = ref<HTMLElement>()
const champ = ref<HTMLInputElement>()

const lignes = ref<{ texte: string, classe?: string }[]>([])
const saisie = ref('')
const connecte = ref(false)
const occupe = ref(false)

let etat: EtatDemo = creerEtat()
let minuteurInactivite: ReturnType<typeof setTimeout> | undefined

function ecrire(texte: string, classe?: string) {
  lignes.value.push({ texte, classe })
}

async function defiler() {
  await nextTick()
  sortie.value?.scrollTo({ top: sortie.value.scrollHeight })
}

function armerInactivite() {
  clearTimeout(minuteurInactivite)
  if (!connecte.value) return
  minuteurInactivite = setTimeout(() => {
    // Fidèle au vrai serveur : les connexions inactives sont coupées après 60 s.
    connecte.value = false
    ecrire('Délai d\'inactivité dépassé (60 s) : connexion fermée par le serveur.', 'terminal__ligne--info')
    ecrire('Appuyez sur Entrée pour vous reconnecter.', 'terminal__ligne--info')
    defiler()
  }, DELAI_INACTIVITE)
}

function connecter() {
  etat = creerEtat()
  connecte.value = true
  ecrire('Connecté au serveur FTP — démo simulée dans le navigateur.', 'terminal__ligne--info')
  ecrire('Tapez "help" pour la liste des commandes.', 'terminal__ligne--info')
  armerInactivite()
  defiler()
}

function contenuGenere(nom: string, taille: number): string {
  const motif = `Contenu de démonstration du fichier ${nom} (portfolio ftp-go).\n`
  return motif.repeat(Math.max(1, Math.ceil(taille / motif.length))).slice(0, taille)
}

function livrerFichier(nom: string, contenu: string) {
  const url = URL.createObjectURL(new Blob([contenu], { type: 'text/plain' }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  lien.click()
  URL.revokeObjectURL(url)
}

async function telecharger({ nom, taille, contenu }: Telechargement) {
  if (taille <= SEUIL_GROS_FICHIER) {
    ecrire(`Réception de ${nom} (${formatTaille(taille)})… ok`)
    livrerFichier(nom, contenu ?? contenuGenere(nom, taille))
    return
  }
  // Gros fichier : le vrai serveur l'envoie chunk par chunk, on anime pareil.
  occupe.value = true
  const chunks = Math.ceil(taille / TAILLE_CHUNK)
  ecrire(`Fichier volumineux : envoi en ${chunks} chunks de 1 Mio…`)
  const indexBarre = lignes.value.length
  lignes.value.push({ texte: '' })
  await defiler()
  // Progression indexée sur le temps écoulé (et pas sur un nombre fixe de
  // pauses) : la durée reste ~1,2 s même quand le navigateur bride les timers.
  const DUREE_ANIMATION = 1200
  const debut = Date.now()
  let chunk = 0
  while (chunk < chunks) {
    chunk = Math.min(chunks, Math.max(chunk + 1, Math.round(((Date.now() - debut) / DUREE_ANIMATION) * chunks)))
    const ratio = chunk / chunks
    const pleins = Math.round(ratio * 24)
    lignes.value[indexBarre] = {
      texte: `[${'#'.repeat(pleins)}${'-'.repeat(24 - pleins)}] ${Math.round(ratio * 100)} % — chunk ${chunk}/${chunks}`,
    }
    if (chunk % 5 === 0 || chunk === chunks) await defiler()
    if (chunk < chunks) await new Promise(r => setTimeout(r, 30))
  }
  ecrire(`Réception de ${nom} (${formatTaille(taille)})… ok`)
  ecrire('(démo : le fichier téléchargé est tronqué à 1 Mio)', 'terminal__ligne--info')
  livrerFichier(nom, contenuGenere(nom, TAILLE_CHUNK))
  occupe.value = false
}

async function soumettre() {
  if (occupe.value) return
  const commande = saisie.value
  saisie.value = ''

  if (!connecte.value) {
    connecter()
    return
  }

  ecrire(`${invite(etat)} > ${commande}`, 'terminal__ligne--saisie')
  const resultat = executerCommande(etat, commande)
  for (const ligne of resultat.lignes) ecrire(ligne)

  if (resultat.deconnexion) {
    connecte.value = false
    clearTimeout(minuteurInactivite)
    ecrire('Appuyez sur Entrée pour vous reconnecter.', 'terminal__ligne--info')
  }
  else {
    armerInactivite()
  }

  await defiler()
  if (resultat.telechargement) await telecharger(resultat.telechargement)
  await defiler()
}

function fermer() {
  emit('update:ouvert', false)
}

watch(() => props.ouvert, async (ouvert) => {
  if (ouvert) {
    dialogue.value?.showModal()
    lignes.value = []
    connecter()
    await nextTick()
    champ.value?.focus()
  }
  else {
    clearTimeout(minuteurInactivite)
    dialogue.value?.close()
  }
})

onBeforeUnmount(() => clearTimeout(minuteurInactivite))
</script>

<template>
  <dialog ref="dialogue" class="terminal" aria-label="Démo interactive du client FTP" @close="fermer">
    <div class="terminal__barre">
      <span class="terminal__titre">ftp-client — démo interactive</span>
      <button class="terminal__fermer" aria-label="Fermer la démo" @click="fermer">✕</button>
    </div>

    <div ref="sortie" class="terminal__sortie" @click="champ?.focus()">
      <p v-for="(l, i) in lignes" :key="i" class="terminal__ligne" :class="l.classe">{{ l.texte }}</p>
    </div>

    <form class="terminal__invite" @submit.prevent="soumettre">
      <label class="terminal__prompt" for="demo-ftp-champ">{{ connecte ? `${invite(etat)} >` : '>' }}</label>
      <input
        id="demo-ftp-champ"
        ref="champ"
        v-model="saisie"
        class="terminal__champ"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="connecte ? 'help, List, Cd, Get zib.txt…' : 'Entrée pour se reconnecter'"
      >
    </form>

    <p class="terminal__note">
      Protocole simulé pour la démo — le vrai client/serveur tourne en TCP :
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
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(226, 233, 241, 0.12);
}
.terminal__titre {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8fb4d8;
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
.terminal__ligne--saisie { color: #7ee0a3; }
.terminal__ligne--info { color: #8fb4d8; }
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
