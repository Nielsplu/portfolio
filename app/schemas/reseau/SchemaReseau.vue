<script setup lang="ts">
import { MARQUEURS, adressage, dhcp, dns, hotesDuVlan, pareFeu } from './donnees'

// Schéma de l'infrastructure réseau, reconstruit depuis les fichiers de
// configuration du dépôt (github.com/Nielsplu/sae-reseaux) : dhcpd.conf, les
// zones Bind9 et les règles iptables de start.sh.
//
// La topologie est en SVG — elle se lit d'un coup d'œil — mais les détails
// restent en HTML : le texte y est sélectionnable, traduisible, agrandissable,
// et lisible par un lecteur d'écran sans qu'on ait à le dupliquer ailleurs.

const idTitre = useId()
const idDesc = useId()
</script>

<template>
  <div class="schema">
    <figure class="schema__figure">
      <div class="schema__cadre">
        <svg viewBox="0 0 760 366" class="schema__svg" role="img" :aria-labelledby="`${idTitre} ${idDesc}`">
          <title :id="idTitre">Topologie du réseau</title>
          <desc :id="idDesc">
            Une machine externe rejoint un routeur, qui porte le pare-feu et la
            traduction d'adresses, puis distribue un VLAN numéro 18 sur lequel
            se trouvent quatre machines : serveur, DNS secondaire, serveur DHCP
            et hôte interne. Le détail des adresses figure dans le tableau qui
            suit.
          </desc>

          <!-- ---------- côté externe ---------- -->
          <text x="380" y="16" class="t-bande">RÉSEAU EXTERNE</text>
          <rect x="300" y="24" width="160" height="54" rx="6" class="boite" />
          <text x="380" y="46" class="t-nom">externe</text>
          <text x="380" y="65" class="t-ip">192.168.0.1/24</text>

          <!-- lien eth0 + traduction d'adresses -->
          <line x1="380" y1="78" x2="380" y2="118" class="lien" />
          <text x="392" y="92" class="t-note">eth0</text>
          <text x="392" y="108" class="t-nat">NAT 8080 → 10.0.18.18:80</text>

          <!-- ---------- routeur ---------- -->
          <rect x="240" y="118" width="280" height="104" rx="8" class="boite boite--accent" />
          <text x="380" y="142" class="t-nom">routeur</text>
          <text x="380" y="162" class="t-ip">eth1.18 · 10.0.18.1/24</text>
          <text x="380" y="181" class="t-role">pare-feu iptables · DROP par défaut</text>
          <text x="380" y="199" class="t-role">DNS maître · ip_forward = 1</text>

          <!-- ---------- bus VLAN ---------- -->
          <line x1="380" y1="222" x2="380" y2="256" class="lien" />
          <line x1="60" y1="256" x2="700" y2="256" class="lien lien--bus" />
          <text x="700" y="246" class="t-bande t-bande--fin">VLAN 18 · 10.0.18.0/24</text>

          <!-- ---------- machines du VLAN ---------- -->
          <g v-for="hote in hotesDuVlan" :key="hote.nom">
            <line :x1="hote.x" y1="256" :x2="hote.x" y2="292" class="lien" />
            <rect :x="hote.x - 68" y="292" width="136" height="58" rx="6" class="boite" />
            <text :x="hote.x" y="317" class="t-nom">{{ hote.nom }}</text>
            <text :x="hote.x" y="338" class="t-ip">{{ hote.ip }}</text>
          </g>
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
/* Le schéma ne descend pas sous ~560 px sans devenir illisible : il défile
   plutôt que de se tasser. */
.schema__cadre {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
  padding: var(--esp-4);
}
.schema__svg {
  display: block;
  width: 100%;
  min-width: 560px;
  height: auto;
}

.boite {
  fill: var(--surface);
  stroke: var(--line);
  stroke-width: 1;
}
.boite--accent {
  stroke: var(--accent);
  stroke-width: 1.5;
}
.lien {
  stroke: var(--accent);
  stroke-width: 1.5;
  opacity: 0.55;
}
.lien--bus {
  stroke-width: 2.5;
  opacity: 0.8;
}

.schema__svg text {
  font-family: var(--font-mono);
  text-anchor: middle;
}
.t-nom { fill: var(--ink); font-size: 16px; font-weight: 600; }
.t-ip { fill: var(--accent); font-size: 14px; }
.t-role { fill: var(--muted); font-size: 12.5px; }
.t-note { fill: var(--muted); font-size: 13px; text-anchor: start; }
.t-nat { fill: var(--accent); font-size: 13px; text-anchor: start; }
.t-bande {
  fill: var(--muted);
  font-size: 12.5px;
  letter-spacing: 0.08em;
}
.t-bande--fin { text-anchor: end; }

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
