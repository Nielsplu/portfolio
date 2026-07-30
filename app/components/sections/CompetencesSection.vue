<script setup lang="ts">
import { competences } from '~/content'
</script>

<template>
  <BaseSection id="competences" eyebrow="compétences" title="Compétences & outils">
    <div class="skills">
      <article v-for="(c, i) in competences" :key="c.titre" v-reveal="i * 70" class="reveal card skill">
        <span class="skill__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="skill__title">{{ c.titre }}</h3>
        <div class="skill__groups">
          <div v-for="g in c.groupes" :key="g.label" class="skill__group">
            <p class="skill__label">{{ g.label }}</p>
            <TechList :items="g.items" :label="`${c.titre} — ${g.label}`" />
          </div>
        </div>
      </article>
    </div>
  </BaseSection>
</template>

<style scoped>
.skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1.4rem;
}
.skill {
  position: relative;
  overflow: hidden;
  padding: 1.6rem 1.7rem;
}
/* Grand chiffre filigrane : signature visuelle en fond. */
.skill__num {
  position: absolute;
  top: -0.6rem;
  right: 0.4rem;
  font-family: var(--font-mono);
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--accent-soft);
  opacity: 0.7;
  pointer-events: none;
  user-select: none;
}
.skill__title {
  position: relative;
  font-size: var(--txt-lg);
  margin-bottom: 1.3rem;
}
.skill__groups {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.skill__label {
  font-size: var(--txt-2xs);
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.55rem;
}
</style>
