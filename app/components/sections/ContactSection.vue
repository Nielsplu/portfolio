<script setup lang="ts">
import { profil } from '~/content'
// Voir BaseSection : import depuis ./ordre pour ne pas créer de cycle.
import { numeroSection } from '~/sections/ordre'

// Nomme la région d'après son titre (voir BaseSection pour le détail).
const idTitre = useId()

const { copier, etat } = usePressePapiers()


/** Nom accessible du bouton de copie, qui reflète aussi son issue. */
const libelleCopie = computed(() => ({
  attente: "Copier l'adresse e-mail",
  copie: 'Adresse copiée',
  echec: 'Copie impossible',
}[etat.value]))

/** En cas d'échec, on redonne l'adresse — affichée juste à côté de toute façon. */
const annonceCopie = computed(() => ({
  attente: '',
  copie: 'Adresse copiée dans le presse-papiers',
  echec: `Copie impossible. L'adresse est ${profil.email}`,
}[etat.value]))

/** Même forme pour les trois : un rang homogène, pas trois actions
 *  concurrentes. Noms accessibles écrits en clair, une concaténation donnant
 *  « Télécharger Mon CV ». */
const liensSecondaires = computed(() => [
  { label: 'GitHub', url: profil.github, externe: true, nomAccessible: 'Mon profil GitHub (nouvel onglet)' },
  { label: 'LinkedIn', url: profil.linkedin, externe: true, nomAccessible: 'Mon profil LinkedIn (nouvel onglet)' },
  { label: 'Mon CV', url: profil.cv, externe: false, nomAccessible: 'Télécharger mon CV au format PDF' },
])
</script>

<template>
  <section id="contact" class="section" :aria-labelledby="idTitre">
    <div class="container">
      <div v-reveal class="reveal card contact">
        <!-- Balisage propre à cette section, mais même traitement. -->
        <p class="eyebrow eyebrow--centre">
          <span class="eyebrow__num" aria-hidden="true">{{ numeroSection('contact') }}</span>
          <span class="eyebrow__trait" aria-hidden="true" />
          contact
        </p>
        <h2 :id="idTitre" class="section-title contact__title">Travaillons ensemble</h2>
        <p class="contact__text">
          Un projet, une question ? Je réponds rapidement.
        </p>

        <!-- L'adresse est l'action principale, au lieu d'être noyée parmi cinq
             boutons identiques. Le bouton de copie est adjacent et non imbriqué,
             un bouton dans un lien étant invalide. -->
        <div class="adresse">
          <a :href="`mailto:${profil.email}`" class="adresse__lien">
            <svg class="adresse__icone" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
              <path d="M3 6.5l9 6 9-6" />
            </svg>
            <span class="adresse__texte">{{ profil.email }}</span>
          </a>
          <button
            class="adresse__copie"
            :class="{ 'adresse__copie--fait': etat === 'copie' }"
            type="button"
            :aria-label="libelleCopie"
            :title="libelleCopie"
            @click="copier(profil.email)"
          >
            <svg v-if="etat === 'copie'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" />
            </svg>
          </button>
        </div>

        <!-- Le nom accessible d'un élément déjà focalisé n'est pas réannoncé
             de façon fiable : cette région annonce l'issue, succès comme échec. -->
        <p class="sr-only" role="status" aria-live="polite">{{ annonceCopie }}</p>

        <ul class="secondaires">
          <li v-for="l in liensSecondaires" :key="l.url">
            <!-- aria-label et non un span masqué, qui se retrouvait dans tout
                 copier-coller : « GitHub(nouvel onglet) ». -->
            <a
              :href="l.url"
              :target="l.externe ? '_blank' : undefined"
              :rel="l.externe ? 'noopener' : undefined"
              :download="l.externe ? undefined : true"
              :aria-label="l.nomAccessible"
              class="secondaires__lien"
            >
              {{ l.label }}
              <span class="secondaires__fleche" aria-hidden="true">{{ l.externe ? '↗' : '↓' }}</span>
            </a>
          </li>
        </ul>

        <p class="contact__meta">{{ profil.localisation }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 3rem clamp(1.5rem, 5vw, 3.5rem);
  text-align: center;
}
.contact__title { margin-bottom: var(--esp-3); }
.contact__text { color: var(--muted); margin: 0 0 var(--esp-7); }

/* ---- Adresse e-mail : l'élément central ---- */
.adresse {
  display: flex;
  align-items: stretch;
  max-width: 27rem;
  margin: 0 auto;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
  overflow: hidden;
  transition: border-color var(--duree-rapide) var(--courbe), box-shadow var(--duree-rapide) var(--courbe);
}
.adresse:hover {
  border-color: var(--accent-bright);
  box-shadow: var(--shadow-sm);
}
/* `overflow: hidden` rognerait l'anneau des enfants : on le remonte sur le
   conteneur. `outline` et non `box-shadow` — jamais rogné, et visible en mode
   contrastes forcés où les ombres sont ignorées. */
.adresse:focus-within {
  border-color: var(--accent);
  outline: 2px solid var(--accent-bright);
  outline-offset: 2px;
}
.adresse__lien {
  display: flex;
  align-items: center;
  gap: var(--esp-3);
  flex: 1;
  min-width: 0;
  padding: var(--esp-4) var(--esp-4);
  color: var(--ink);
  text-decoration: none;
  transition: color var(--duree-rapide) var(--courbe);
}
.adresse__lien:hover { color: var(--accent); }
/* L'anneau global est géré par .adresse:focus-within. */
.adresse__lien:focus-visible { outline: none; }
.adresse__icone {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  color: var(--muted);
}
.adresse__lien:hover .adresse__icone { color: currentColor; }
.adresse__texte {
  font-family: var(--font-mono);
  font-size: var(--txt-md);
  /* Tronquée plutôt que de déformer le champ. */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.adresse__copie {
  display: grid;
  place-items: center;
  width: 46px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-left: 1.5px solid var(--line);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color var(--duree-rapide) var(--courbe), background var(--duree-rapide) var(--courbe);
}
.adresse__copie:hover {
  color: var(--accent);
  background: var(--surface);
}
.adresse__copie:focus-visible { outline: none; }
.adresse__copie--fait { color: var(--succes); }
.adresse__copie svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---- Liens secondaires ---- */
.secondaires {
  display: flex;
  justify-content: center;
  gap: var(--esp-6);
  flex-wrap: wrap;
  list-style: none;
  margin: var(--esp-6) 0 0;
  padding: 0;
}
.secondaires__lien {
  display: inline-flex;
  align-items: center;
  gap: var(--esp-1);
  font-size: var(--txt-sm);
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color var(--duree-rapide) var(--courbe);
}
.secondaires__lien:hover { color: var(--accent); }
.secondaires__fleche {
  font-size: 0.8em;
  /* Décalage dans la direction de l'action. */
  transition: transform var(--duree-rapide) var(--courbe);
}
.secondaires__lien:hover .secondaires__fleche { transform: translate(1px, -1px); }

.contact__meta {
  font-family: var(--font-mono);
  font-size: var(--txt-xs);
  color: var(--muted);
  margin: var(--esp-7) 0 0;
}

@media (max-width: 420px) {
  .secondaires { gap: var(--esp-5); }
}
</style>
