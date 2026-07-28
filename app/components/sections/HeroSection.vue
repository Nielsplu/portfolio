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
          <span class="hero__prompt-symbol">&gt;</span>
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
             de flottaison, elle pèse donc sur le premier affichage. -->
        <NuxtPicture
          src="/photo.jpg"
          :img-attrs="{ class: 'hero__photo' }"
          :alt="`Portrait de ${profil.nom}`"
          width="300"
          height="300"
          sizes="300px"
          densities="1x 2x"
          fit="cover"
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
.hero__photo-wrap { display: flex; justify-content: center; }
.hero__photo {
  width: min(300px, 70vw);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  border: 6px solid var(--surface);
  box-shadow: var(--shadow), 0 0 0 2px var(--accent-soft);
}
@media (max-width: 820px) {
  .hero__grid { grid-template-columns: 1fr; }
  .hero__photo-wrap { order: -1; }
}
</style>
