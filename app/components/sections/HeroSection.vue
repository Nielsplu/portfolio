<script setup lang="ts">
import { profil } from '~/content'

// Nomme la région d'après le titre principal (voir BaseSection pour le détail).
const idTitre = useId()
</script>

<template>
  <section id="accueil" class="hero" :aria-labelledby="idTitre">
    <div class="container hero__grid">
      <div>
        <p v-reveal class="reveal hero__status">{{ profil.statut }}</p>
        <h1 :id="idTitre" v-reveal="80" class="reveal hero__name">{{ profil.nom }}</h1>
        <p v-reveal="160" class="reveal hero__prompt">
          <!-- Purement décoratif : sans aria-hidden, un lecteur d'écran
               annonce « supérieur à » avant la phrase. -->
          <span class="hero__prompt-symbol" aria-hidden="true">&gt;</span>
          développement web · sécurité des SI
        </p>
        <p v-reveal="240" class="reveal hero__text">{{ profil.accroche }}</p>
        <div v-reveal="320" class="reveal hero__actions">
          <a href="#projets" class="btn btn--primary">Voir mes projets</a>
          <a href="#contact" class="btn btn--ghost">Me contacter</a>
        </div>
      </div>
      <div v-reveal="200" class="reveal hero__photo-wrap">
        <!-- <NuxtPicture> et non <img> : la source est une photo d'appareil de
             plusieurs mégaoctets, réduite et réencodée au build. Le composant
             « picture » émet des <source> en AVIF puis WebP, avec repli JPEG
             pour les navigateurs qui ne suivent pas — un simple <NuxtImg>
             aurait conservé le format d'origine.
             `preload` et `loading="eager"` : l'image est au-dessus de la ligne
             de flottaison, elle pèse donc sur le premier affichage.
             `position: attention` : la source est en 4:3 alors que l'affichage
             est carré. Un recadrage centré par défaut coupe à l'aveugle et peut
             trancher le sujet ; cette stratégie de sharp conserve la zone la
             plus saillante de l'image. Basculer sur 'top' si le cadrage du
             visage n'est pas bon. -->
        <NuxtPicture
          src="/photo.jpg"
          :img-attrs="{ class: 'hero__photo' }"
          :alt="`Portrait de ${profil.nom}`"
          width="300"
          height="300"
          sizes="300px"
          densities="1x 2x"
          fit="cover"
          :modifiers="{ position: 'attention' }"
          format="avif,webp"
          loading="eager"
          preload
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  /* Même rythme que les autres sections (token partagé) : le hero respirait
     légèrement différemment, ce qui se voyait au défilement. */
  padding-block: var(--section-pad);
  overflow: hidden;
}
/* Fond en grille de points, estompé vers les bords : touche « technique »
   discrète, sans image ni requête réseau. */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--line) 1px, transparent 1px);
  background-size: 24px 24px;
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 70% 30%, #000, transparent 75%);
  mask-image: radial-gradient(ellipse 80% 60% at 70% 30%, #000, transparent 75%);
  opacity: 0.6;
  pointer-events: none;
}
.hero__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 3rem;
  align-items: center;
}
.hero__status {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.9rem;
  margin: 0 0 1.1rem;
}
.hero__name {
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  letter-spacing: -0.01em;
}
.hero__prompt {
  font-family: var(--font-mono);
  color: var(--accent-bright);
  font-size: 0.95rem;
  margin: 0.7rem 0 1.1rem;
}
.hero__prompt-symbol { color: var(--muted); margin-right: 0.4rem; }
.hero__text { color: var(--muted); max-width: 56ch; margin: 0 0 0.9rem; }
.hero__actions { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-top: 1.6rem; }
/* Taille de la photo, réutilisée par les décors en orbite ci-dessous. */
.hero__photo-wrap {
  --taille-photo: min(300px, 70vw);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* <NuxtPicture> intercale un <picture> entre le conteneur et l'image. Inline
   par défaut, il ajoutait un interligne sous la photo et décentrait le halo. */
.hero__photo-wrap picture {
  display: block;
  line-height: 0;
  /* Au-dessus des décors, qui restent purement d'arrière-plan. */
  position: relative;
  z-index: 1;
}
/* Anneau pointillé en orbite : reprend le vocabulaire graphique du site (la
   grille de points du hero, les « // » des intitulés) au lieu d'un halo flou
   générique. Décoratif, donc en pseudo-élément : rien n'entre dans le DOM ni
   dans l'arbre d'accessibilité. */
.hero__photo-wrap::before,
.hero__photo-wrap::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  pointer-events: none;
}
.hero__photo-wrap::before {
  width: calc(var(--taille-photo) + 30px);
  aspect-ratio: 1;
  border: 1px dashed var(--accent-bright);
  opacity: 0.35;
  transform: translate(-50%, -50%);
  animation: orbite 40s linear infinite;
}
/* Arc plein, ouvert sur deux côtés : donne un point de repère fixe que
   l'anneau pointillé vient croiser en tournant. */
.hero__photo-wrap::after {
  width: calc(var(--taille-photo) + 14px);
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-top-color: var(--accent);
  border-bottom-color: var(--accent);
  opacity: 0.5;
  transform: translate(-50%, -50%) rotate(-24deg);
  transition: opacity var(--duree-moyenne) var(--courbe), transform var(--duree-moyenne) var(--courbe);
}
.hero__photo-wrap:hover::after {
  opacity: 0.9;
  transform: translate(-50%, -50%) rotate(-8deg);
}
@keyframes orbite {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
/* La rotation continue est une animation d'ambiance : elle disparaît pour qui
   demande moins de mouvement, l'anneau restant visible et statique. */
@media (prefers-reduced-motion: reduce) {
  .hero__photo-wrap::before { animation: none; }
}
/* :deep() indispensable — <NuxtPicture> rend le <img> depuis son propre
   composant, qui ne reçoit donc pas l'attribut de scope de celui-ci. Sans cette
   enveloppe, la règle ne s'appliquait à rien : la photo est restée un carré
   sans arrondi ni cadre tant que le sélecteur est resté scopé. Le <picture>,
   lui, porte bien l'attribut, d'où la règle non enveloppée ci-dessus. */
.hero__photo-wrap :deep(.hero__photo) {
  width: min(300px, 70vw);
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  /* Anneau fin plutôt qu'une bordure épaisse couleur surface : celle-ci était
     blanche sur un fond quasi blanc en thème clair, donc invisible, et ne
     laissait que le halo extérieur pour détourer la photo. Ici l'anneau reste
     lisible dans les deux thèmes, et l'ombre porte le relief. */
  box-shadow:
    0 0 0 1px var(--line),
    0 20px 45px -28px var(--shadow-color);
  transition: box-shadow var(--duree-moyenne) var(--courbe), transform var(--duree-moyenne) var(--courbe);
}
/* Le survol réchauffe l'anneau sans déplacer la mise en page. */
.hero__photo-wrap:hover :deep(.hero__photo) {
  box-shadow:
    0 0 0 1px var(--accent-bright),
    0 24px 50px -26px var(--shadow-color);
  transform: translateY(-2px);
}
@media (max-width: 820px) {
  .hero__grid { grid-template-columns: 1fr; }
  .hero__photo-wrap { order: -1; }
}
</style>
