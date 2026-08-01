<script setup lang="ts">
import { profil } from '~/content'

// Nomme la région d'après le titre (voir BaseSection).
const idTitre = useId()
</script>

<template>
  <section id="accueil" class="hero" :aria-labelledby="idTitre">
    <div class="container hero__grid">
      <div>
        <p v-reveal class="reveal hero__status">{{ profil.statut }}</p>
        <h1 :id="idTitre" v-reveal="80" class="reveal hero__name">{{ profil.nom }}</h1>
        <p v-reveal="160" class="reveal hero__prompt">
          <!-- Sinon un lecteur d'écran annonce « supérieur à ». -->
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
        <!-- <NuxtPicture> émet AVIF puis WebP avec repli JPEG ; <NuxtImg>
             aurait gardé le format d'origine. `preload` car l'image est
             au-dessus de la ligne de flottaison.
             `position: attention` : source en 4:3 pour un affichage carré, un
             recadrage centré trancherait le sujet. Basculer sur 'top' si le
             cadrage du visage ne convient pas. -->
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
  /* Même rythme que les autres sections. */
  padding-block: var(--section-pad);
  overflow: hidden;
}
/* Grille de points estompée : touche technique, sans image ni requête. */
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
  gap: var(--esp-9);
  align-items: center;
}
.hero__status {
  display: inline-block;
  font-size: var(--txt-xs);
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  padding: var(--esp-2) var(--esp-4);
  margin: 0 0 var(--esp-5);
}
.hero__name {
  font-size: var(--txt-3xl);
  letter-spacing: -0.01em;
}
.hero__prompt {
  font-family: var(--font-mono);
  color: var(--accent-bright);
  font-size: var(--txt-md);
  margin: var(--esp-3) 0 var(--esp-5);
}
.hero__prompt-symbol { color: var(--muted); margin-right: var(--esp-2); }
.hero__text { color: var(--muted); max-width: 56ch; margin: 0 0 var(--esp-4); }
.hero__actions { display: flex; gap: var(--esp-4); flex-wrap: wrap; margin-top: var(--esp-6); }
/* Taille de la photo, réutilisée par les décors en orbite ci-dessous. */
.hero__photo-wrap {
  --taille-photo: min(300px, 70vw);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* <picture> est inline par défaut : interligne sous la photo, halo décentré. */
.hero__photo-wrap picture {
  display: block;
  line-height: 0;
  /* Au-dessus des décors, qui restent purement d'arrière-plan. */
  position: relative;
  z-index: 1;
}
/* Anneau en orbite, dans le vocabulaire graphique du site. Pseudo-éléments :
   rien n'entre dans le DOM ni dans l'arbre d'accessibilité. */
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
/* Repère fixe que l'anneau pointillé croise en tournant. */
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
/* Rotation d'ambiance : retirée sous prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .hero__photo-wrap::before { animation: none; }
}
/* :deep() indispensable : <NuxtPicture> rend le <img> depuis son propre
   composant, qui ne reçoit pas l'attribut de scope. Sans ça la photo restait
   un carré sans arrondi. */
.hero__photo-wrap :deep(.hero__photo) {
  width: min(300px, 70vw);
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  /* Anneau fin : une bordure couleur surface était blanche sur fond blanc,
     donc invisible en thème clair. */
  box-shadow:
    0 0 0 1px var(--line),
    0 20px 45px -28px var(--shadow-color);
  transition: box-shadow var(--duree-moyenne) var(--courbe), transform var(--duree-moyenne) var(--courbe);
}
/* Survol : sans déplacer la mise en page. */
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
