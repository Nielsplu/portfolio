<script setup lang="ts">
import { BANDES, BOITES, BUS, LIENS, NOTES, VUE } from './disposition'
import { MARQUEURS, adressage, dhcp, dns, pareFeu } from './donnees'

// Schéma de l'infrastructure réseau, reconstruit depuis les fichiers de
// configuration du dépôt (github.com/Nielsplu/sae-reseaux) : dhcpd.conf, les
// zones Bind9 et les règles iptables de start.sh.
//
// La topologie est en SVG — elle se lit d'un coup d'œil — mais les détails
// restent en HTML : le texte y est sélectionnable, traduisible, agrandissable,
// et lisible par un lecteur d'écran sans qu'on ait à le dupliquer ailleurs.
//
// La géométrie vit dans disposition.ts, où des tests garantissent que rien ne
// déborde ni ne se recouvre : un dessin ne se relit pas dans un diff.

const idTitre = useId()
const idDesc = useId()
</script>

<template>
  <div class="schema">
    <figure class="schema__figure">
      <div class="schema__cadre">
        <svg
          :viewBox="`0 0 ${VUE.largeur} ${VUE.hauteur}`"
          class="schema__svg"
          role="img"
          :aria-labelledby="`${idTitre} ${idDesc}`"
        >
          <title :id="idTitre">Topologie du réseau</title>
          <desc :id="idDesc">
            Trois niveaux de haut en bas. À l'extérieur, une machine rejoint le
            routeur, qui porte le pare-feu, la traduction d'adresses et le
            serveur DNS maître. En dessous, un VLAN numéro 18 relie quatre
            machines : un serveur, le DNS de la zone déléguée, le serveur DHCP
            et l'hôte web. Le détail des adresses, des baux, des zones et des
            règles de filtrage figure dans les tableaux qui suivent.
          </desc>

          <!-- Bandes de lecture : extérieur, passerelle, VLAN. -->
          <template v-for="(bande, i) in BANDES" :key="bande.id">
            <rect
              x="0" :y="bande.y" :width="VUE.largeur" :height="bande.hauteur"
              :class="['bande', { 'bande--alt': i % 2 === 1 }]"
            />
            <text x="16" :y="bande.y + 24" class="t-bande">{{ bande.titre }}</text>
          </template>

          <!-- Traits : câbles en continu, relations logiques en pointillés. -->
          <line :x1="BUS.x1" :y1="BUS.y" :x2="BUS.x2" :y2="BUS.y" class="lien lien--bus" />
          <line
            v-for="lien in LIENS"
            :key="`${lien.de}-${lien.vers}`"
            :x1="lien.x1" :y1="lien.y1" :x2="lien.x2" :y2="lien.y2"
            :class="['lien', { 'lien--logique': lien.logique }]"
          />
          <text
            v-for="lien in LIENS.filter(l => l.etiquette)"
            :key="`etiquette-${lien.vers}`"
            :x="lien.x1 + 10"
            :y="lien.y1 + 22"
            class="t-logique"
          >{{ lien.etiquette }}</text>

          <!-- Machines et panneau de filtrage. -->
          <template v-for="boite in BOITES" :key="boite.id">
            <rect
              :x="boite.x" :y="boite.y" :width="boite.largeur" :height="boite.hauteur"
              rx="8" :class="['boite', { 'boite--accent': boite.accent }]"
            />
            <text :x="boite.x + 16" :y="boite.y + 28" class="t-nom">{{ boite.titre }}</text>
            <text
              v-if="boite.badge"
              :x="boite.x + boite.largeur - 14" :y="boite.y + 26"
              class="t-badge"
            >{{ boite.badge }}</text>
            <text
              v-for="(ligne, i) in boite.lignes"
              :key="ligne"
              :x="boite.x + 16" :y="boite.y + 56 + i * 23"
              class="t-detail"
            >{{ ligne }}</text>
          </template>

          <!-- Sens du trafic et plage de baux. -->
          <text
            v-for="note in NOTES"
            :key="note.id"
            :x="note.x" :y="note.y"
            :class="['t-note', { 't-note--accent': note.accent, 't-note--centre': note.centre }]"
          >{{ note.texte }}</text>
        </svg>
      </div>
      <figcaption class="schema__legende">
        Reconstruit depuis <code>dhcpd.conf</code>, les zones Bind9 et les règles
        <code>iptables</code> du dépôt. Les fichiers sont paramétrés
        (<code v-for="(m, i) in MARQUEURS" :key="m">{{ i ? ', ' : '' }}{{ m }}</code>) et
        instanciés par <code>start.sh</code> ; les valeurs montrées ici sont
        celles du rapport, avec X = 18.
      </figcaption>
    </figure>

    <div class="schema__details">
      <section class="schema__bloc">
        <h4 class="schema__soustitre">Plan d'adressage</h4>
        <table class="schema__table">
          <thead>
            <tr><th scope="col">Machine</th><th scope="col">Adresse</th><th scope="col">Rôle</th></tr>
          </thead>
          <tbody>
            <tr v-for="hote in adressage" :key="hote.nom">
              <td><code>{{ hote.nom }}</code></td>
              <td><code>{{ hote.ip }}</code></td>
              <td>{{ hote.role }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="schema__bloc">
        <h4 class="schema__soustitre">DHCP <span class="schema__source">isc-dhcp-server</span></h4>
        <dl class="schema__liste">
          <template v-for="ligne in dhcp" :key="ligne.cle">
            <dt>{{ ligne.cle }}</dt>
            <dd>{{ ligne.valeur }}</dd>
          </template>
        </dl>
      </section>

      <section class="schema__bloc">
        <h4 class="schema__soustitre">DNS <span class="schema__source">Bind9</span></h4>
        <!-- La délégation est le point intéressant : une zone fille servie par
             un autre serveur, désignée depuis la zone parente. -->
        <div v-for="zone in dns" :key="zone.nom" class="schema__zone">
          <p class="schema__zoneNom">
            <code>{{ zone.nom }}</code>
            <span class="schema__source">{{ zone.serveur }}</span>
          </p>
          <ul class="schema__enregistrements">
            <li v-for="e in zone.enregistrements" :key="e">
              <code>{{ e }}</code>
            </li>
          </ul>
        </div>
      </section>

      <section class="schema__bloc">
        <h4 class="schema__soustitre">Pare-feu <span class="schema__source">iptables</span></h4>
        <p class="schema__politique">
          <template v-for="(p, i) in pareFeu.politique" :key="p">
            <code>{{ p }}</code><span v-if="i < pareFeu.politique.length - 1"> · </span>
          </template>
        </p>
        <ul class="schema__regles">
          <li v-for="regle in pareFeu.exceptions" :key="regle.quoi">
            <span class="schema__regleQuoi">{{ regle.quoi }}</span>
            <span class="schema__reglePourquoi">{{ regle.pourquoi }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.schema {
  display: grid;
  gap: var(--esp-6);
  /* Un élément de grille vaut `min-width: auto` par défaut : sans cette ligne,
     le schéma refuse de rétrécir sous sa largeur minimale et pousse la fiche
     entière au lieu de défiler dans son cadre. */
  min-width: 0;
}

/* ---------- topologie ---------- */
.schema__figure {
  margin: 0;
  min-width: 0;
}
/* Le schéma ne descend pas sous ~640 px sans devenir illisible : il défile
   plutôt que de se tasser. */
.schema__cadre {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.schema__svg {
  display: block;
  width: 100%;
  min-width: 640px;
  height: auto;
}

.bande { fill: var(--surface); }
.bande--alt { fill: var(--surface-subtle); }

.boite {
  fill: var(--surface);
  stroke: var(--line);
  stroke-width: 1.2;
}
.boite--accent {
  stroke: var(--accent);
  stroke-width: 1.8;
}
.lien {
  stroke: var(--accent);
  stroke-width: 1.6;
  opacity: 0.5;
}
.lien--bus {
  stroke-width: 3;
  opacity: 0.85;
}
/* Pointillés : une délégation DNS n'est pas un câble. */
.lien--logique {
  stroke-dasharray: 5 4;
  opacity: 0.7;
}

.schema__svg text { font-family: var(--font-mono); }
.t-nom { fill: var(--ink); font-size: 18px; font-weight: 600; }
.t-detail { fill: var(--muted); font-size: 15px; }
.t-badge {
  fill: var(--accent);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-anchor: end;
}
.t-bande {
  fill: var(--muted);
  font-size: 15px;
  letter-spacing: 0.1em;
}
.t-note { fill: var(--muted); font-size: 15px; }
.t-note--accent { fill: var(--accent); }
.t-note--centre { text-anchor: middle; }
.t-logique {
  fill: var(--accent);
  font-size: 14px;
}

.schema__legende {
  margin-top: var(--esp-3);
  color: var(--muted);
  font-size: var(--txt-2xs);
  line-height: 1.55;
}
.schema__legende code { font-size: 0.95em; }

/* ---------- détails ---------- */
.schema__details {
  display: grid;
  gap: var(--esp-6);
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
}
.schema__bloc { min-width: 0; }
.schema__soustitre {
  display: flex;
  align-items: baseline;
  gap: var(--esp-2);
  flex-wrap: wrap;
  font-size: var(--txt-md);
  margin: 0 0 var(--esp-3);
}
.schema__source {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  font-weight: 400;
  color: var(--muted);
}

.schema__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--txt-xs);
}
.schema__table th,
.schema__table td {
  text-align: left;
  padding: var(--esp-2) var(--esp-2) var(--esp-2) 0;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.schema__table th {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 500;
}
.schema__table td { color: var(--muted); }
.schema__table code { color: var(--ink); }

.schema__liste {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--esp-2) var(--esp-4);
  margin: 0;
  font-size: var(--txt-xs);
}
.schema__liste dt {
  font-family: var(--font-mono);
  font-size: var(--txt-2xs);
  color: var(--muted);
}
.schema__liste dd { margin: 0; color: var(--ink); }

.schema__zone + .schema__zone { margin-top: var(--esp-4); }
.schema__zoneNom {
  display: flex;
  align-items: baseline;
  gap: var(--esp-2);
  flex-wrap: wrap;
  margin: 0 0 var(--esp-2);
  font-size: var(--txt-xs);
}
.schema__zoneNom code { color: var(--accent); }
.schema__enregistrements {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--esp-1);
}
.schema__enregistrements code {
  font-size: var(--txt-2xs);
  color: var(--muted);
  overflow-wrap: anywhere;
}

.schema__politique {
  margin: 0 0 var(--esp-3);
  font-size: var(--txt-2xs);
  color: var(--muted);
}
.schema__politique code { color: var(--ink); }
.schema__regles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--esp-2);
  font-size: var(--txt-xs);
}
.schema__regles li {
  display: grid;
  gap: 0.1rem;
}
.schema__regleQuoi { font-family: var(--font-mono); color: var(--ink); }
.schema__reglePourquoi { color: var(--muted); font-size: var(--txt-2xs); }

/* Sur papier, le schéma doit tenir dans la largeur sans barre de défilement. */
@media print {
  .schema__cadre { overflow: visible; }
  .schema__svg { min-width: 0; }
}
</style>
