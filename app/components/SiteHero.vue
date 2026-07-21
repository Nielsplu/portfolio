<script setup lang="ts">
import { profil } from '~/data/portfolio'
</script>

<template>
  <section id="accueil" class="hero">
    <div class="container hero__grid">
      <div>
        <p class="hero__status">{{ profil.statut }}</p>
        <h1 class="hero__name">{{ profil.nom }}</h1>
        <p class="hero__prompt">
          <span class="hero__prompt-symbol">&gt;</span>
          alternance : développement web · sécurité des SI
        </p>
        <p class="hero__text">{{ profil.accroche }}</p>
        <p class="hero__text hero__text--search">{{ profil.recherche }}</p>
        <div class="hero__actions">
          <a href="#projets" class="btn btn--primary">Voir mes projets</a>
          <a href="#contact" class="btn btn--ghost">Me contacter</a>
        </div>
      </div>
      <div class="hero__photo-wrap">
        <!-- Remplace public/photo.jpg par ta photo -->
        <img class="hero__photo" src="/photo.jpg" :alt="`Portrait de ${profil.nom}`" width="320" height="320">
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { padding-block: 5rem 4.5rem; }
.hero__grid {
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
.hero__text--search { color: var(--ink); font-weight: 500; }
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
