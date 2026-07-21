<script setup lang="ts">
import { profil } from '~/data/portfolio'
</script>

<template>
  <section id="contact" class="section">
    <div class="container">
      <div class="card contact">
        <p class="eyebrow">contact</p>
        <h2 class="section-title contact__title">Travaillons ensemble</h2>
        <p class="contact__text">
          Un projet, une question ? Je réponds rapidement.
        </p>
        <div class="contact__actions">
          <a :href="`mailto:${profil.email}`" class="btn btn--primary">M'envoyer un email</a>
          <a :href="profil.github" target="_blank" rel="noopener" class="btn btn--ghost">GitHub</a>
          <a :href="profil.linkedin" target="_blank" rel="noopener" class="btn btn--ghost">LinkedIn</a>
          <a :href="profil.cv" class="btn btn--ghost" download>Télécharger mon CV</a>
        </div>
        <p class="contact__meta">{{ profil.localisation }} · {{ profil.email }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 3rem clamp(1.5rem, 5vw, 3.5rem);
  text-align: center;
}
.contact__title { margin-bottom: 0.8rem; }
.contact__text { color: var(--muted); margin: 0 0 1.8rem; }
.contact__actions {
  display: flex;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.contact__meta {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--muted);
  margin: 1.8rem 0 0;
}
</style>
