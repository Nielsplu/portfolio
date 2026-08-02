<script setup lang="ts">
import type { Action, Commande, GroupeCommande } from '~/utils/commandes'
import { profil, projets } from '~/content'
import { construireCommandes, texteRecherchable } from '~/utils/commandes'
import { filtrerParPertinence } from '~/utils/recherche'

// Palette de commandes (Ctrl/⌘ + K) : atteindre une section, ouvrir une fiche
// projet, lancer la démo ou déclencher une action sans quitter le clavier.

const champ = ref<HTMLInputElement>()
const liste = ref<HTMLElement>()

const { ouverte, fermer: demanderFermeture, basculer } = usePalette()
const requete = ref('')
const indexActif = ref(0)

const baseURL = useRuntimeConfig().app.baseURL
const { basculer: basculerTheme } = useTheme()
const { copier } = usePressePapiers()

const { dialogue, attributs } = useModale({
  ouverte: () => ouverte.value,
  fermer: demanderFermeture,
  surOuverture: () => champ.value?.focus(),
})

// Champ vidé à la fermeture plutôt qu'à l'ouverture : la liste ne se réorganise
// pas sous les yeux au moment où la fenêtre apparaît.
watch(ouverte, (visible) => {
  if (visible) return
  requete.value = ''
  indexActif.value = 0
})

const toutes = construireCommandes(projets, profil)

const resultats = computed(() =>
  filtrerParPertinence(toutes, requete.value, texteRecherchable).map(r => r.entree),
)

/** Résultats découpés par groupe, sans réordonner la pertinence. */
const groupes = computed(() => {
  const parGroupe = new Map<GroupeCommande, Commande[]>()
  for (const commande of resultats.value) {
    const existant = parGroupe.get(commande.groupe)
    if (existant) existant.push(commande)
    else parGroupe.set(commande.groupe, [commande])
  }
  return [...parGroupe].map(([nom, commandes]) => ({ nom, commandes }))
})

/** Rang global d'une commande : la navigation clavier ignore les groupes. */
function rang(commande: Commande): number {
  return resultats.value.indexOf(commande)
}

// Désigne l'option active pour les lecteurs d'écran : le focus reste dans le
// champ de saisie, seul `aria-activedescendant` bouge.
const idOptionActive = computed(() => {
  const active = resultats.value[indexActif.value]
  return active ? `palette-${active.id}` : undefined
})

// ------------------------------------------------------------------

function executer(action: Action) {
  demanderFermeture()
  switch (action.type) {
    case 'ancre':
      window.location.hash = action.href
      break
    case 'fiche':
      // Contrat d'URL de ProjetsSection : elle écoute hashchange et ouvre la
      // fiche correspondante.
      window.location.hash = `#projet/${action.slug}`
      break
    case 'demo':
      window.location.hash = `#demo/${action.id}`
      break
    case 'externe':
      window.open(action.url, '_blank', 'noopener')
      break
    case 'fichier':
      window.open(baseURL + action.chemin, '_blank', 'noopener')
      break
    case 'copier':
      void copier(action.valeur)
      break
    case 'theme':
      basculerTheme()
      break
    case 'imprimer':
      window.print()
      break
  }
}

function deplacer(pas: number) {
  const total = resultats.value.length
  if (total === 0) return
  // Boucle aux extrémités, comme tous les sélecteurs de ce genre.
  indexActif.value = (indexActif.value + pas + total) % total
  nextTick(() => {
    liste.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  })
}

function valider() {
  const choix = resultats.value[indexActif.value]
  if (choix) executer(choix.action)
}

// La liste change à chaque frappe : garder l'ancien index désignerait une
// commande sans rapport, voire aucune.
watch(requete, () => { indexActif.value = 0 })

// ------------------------------------------------------------------

function surRaccourci(evenement: KeyboardEvent) {
  if (evenement.key !== 'k' || !(evenement.ctrlKey || evenement.metaKey)) return
  // Une autre fenêtre modale est ouverte (fiche projet, démo) : elle a la
  // main, empiler une seconde couche désorienterait.
  if (!ouverte.value && document.querySelector('dialog[open]')) return

  evenement.preventDefault()
  basculer()
}

onMounted(() => {
  window.addEventListener('keydown', surRaccourci)
  onBeforeUnmount(() => window.removeEventListener('keydown', surRaccourci))
})
</script>

<template>
  <dialog
    ref="dialogue"
    class="palette"
    aria-label="Palette de commandes"
    v-bind="attributs"
  >
    <div class="palette__cadre">
      <div class="palette__saisie">
        <span class="palette__chevron" aria-hidden="true">›</span>
        <input
          ref="champ"
          v-model="requete"
          class="palette__champ"
          type="text"
          role="combobox"
          aria-controls="palette-liste"
          aria-expanded="true"
          :aria-activedescendant="idOptionActive"
          autocomplete="off"
          spellcheck="false"
          placeholder="Rechercher une section, un projet, une action…"
          @keydown.down.prevent="deplacer(1)"
          @keydown.up.prevent="deplacer(-1)"
          @keydown.enter.prevent="valider"
        >
      </div>

      <div id="palette-liste" ref="liste" class="palette__liste" role="listbox" aria-label="Commandes">
        <p v-if="resultats.length === 0" class="palette__vide">
          Aucune commande pour « {{ requete }} ».
        </p>

        <template v-for="groupe in groupes" :key="groupe.nom">
          <!-- Intitulé purement visuel : le libellé de chaque option se suffit
               à lui-même à l'oreille. -->
          <p class="palette__groupe" aria-hidden="true">{{ groupe.nom }}</p>
          <button
            v-for="commande in groupe.commandes"
            :id="`palette-${commande.id}`"
            :key="commande.id"
            class="palette__option"
            :class="{ 'palette__option--actif': rang(commande) === indexActif }"
            type="button"
            role="option"
            :aria-selected="rang(commande) === indexActif"
            @click="executer(commande.action)"
            @mousemove="indexActif = rang(commande)"
          >
            <span class="palette__libelle">{{ commande.libelle }}</span>
            <span v-if="commande.detail" class="palette__detail">{{ commande.detail }}</span>
          </button>
        </template>
      </div>

      <p class="palette__pied" aria-hidden="true">
        <kbd>↑</kbd><kbd>↓</kbd> parcourir · <kbd>↵</kbd> ouvrir · <kbd>Échap</kbd> fermer
      </p>
    </div>
  </dialog>
</template>

<style scoped>
.palette {
  /* Le dialogue occupe la largeur utile ; le cadre porte l'apparence, pour
     que le clic hors cadre puisse fermer. */
  width: min(560px, calc(100% - 2rem));
  padding: 0;
  border: none;
  background: none;
  /* Ancré haut : une palette centrée saute sous les yeux à chaque frappe. */
  margin-top: min(12vh, 6rem);
  margin-inline: auto;
  overflow: visible;
}
.palette::backdrop {
  background: rgb(0 0 0 / 0.45);
  backdrop-filter: blur(2px);
}

.palette__cadre {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.palette__saisie {
  display: flex;
  align-items: center;
  gap: var(--esp-3);
  padding: var(--esp-4) var(--esp-5);
  border-bottom: 1px solid var(--line);
}
.palette__chevron {
  font-family: var(--font-mono);
  color: var(--accent);
  font-size: var(--txt-lg);
  line-height: 1;
}
.palette__champ {
  flex: 1;
  border: none;
  background: none;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--txt-base);
  outline: none;
  min-width: 0;
}
.palette__champ::placeholder { color: var(--muted); }

.palette__liste {
  max-height: min(50vh, 24rem);
  overflow-y: auto;
  padding: var(--esp-2);
}

.palette__groupe {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: var(--esp-3) var(--esp-3) var(--esp-2);
}
.palette__groupe:first-child { margin-top: var(--esp-1); }

.palette__option {
  display: flex;
  align-items: baseline;
  gap: var(--esp-3);
  width: 100%;
  padding: var(--esp-2) var(--esp-3);
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: var(--txt-md);
  text-align: left;
  cursor: pointer;
}
/* Une seule mise en valeur, pilotée au clavier comme à la souris : deux
   surbrillances concurrentes rendraient le choix ambigu. */
.palette__option--actif {
  background: var(--accent-soft);
  color: var(--accent);
}
.palette__libelle {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.palette__detail {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  color: var(--muted);
  flex-shrink: 0;
}

.palette__vide {
  padding: var(--esp-5) var(--esp-3);
  color: var(--muted);
  font-size: var(--txt-md);
  text-align: center;
}

.palette__pied {
  display: flex;
  flex-wrap: wrap;
  gap: var(--esp-2);
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: var(--esp-2) var(--esp-4);
  border-top: 1px solid var(--line);
  background: var(--surface-subtle);
  font-size: var(--txt-2xs);
  color: var(--muted);
}
.palette__pied kbd {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  border: 1px solid var(--line);
  border-bottom-width: 2px;
  border-radius: 4px;
  padding: 0.1em 0.4em;
  background: var(--surface);
}

/* Sur un écran étroit la palette occupe le haut de l'écran : la liste garde
   une hauteur exploitable sans pousser le pied hors du viewport. */
@media (max-height: 560px) {
  .palette { margin-top: var(--esp-4); }
  .palette__liste { max-height: 40vh; }
}
</style>
