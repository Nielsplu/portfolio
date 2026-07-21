<script setup lang="ts">
import { profil } from '~/data/portfolio'
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <span>© {{ new Date().getFullYear() }} — {{ profil.nom }}</span>
      <span class="footer__mono">$ build --with nuxt</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-block: 1.4rem;
  color: var(--muted);
  font-size: 0.85rem;
}
.footer__inner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.footer__mono { font-family: var(--font-mono); }
</style>
