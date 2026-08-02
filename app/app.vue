<script setup lang="ts">
import { profil, projets } from '~/content'

// Données structurées schema.org (JSON-LD). Sans elles, un moteur ne lit qu'un
// bloc de texte ; avec elles, il sait qu'il s'agit d'une personne, développeur,
// à Nantes, rattachée à ces profils GitHub et LinkedIn — ce qui alimente les
// panneaux de connaissances et les recherches nominatives.
const { siteUrl } = useRuntimeConfig().public

// Les technologies déclarées sont dérivées des tags de projets : tous
// techniques, et la liste reste juste sans entretien quand un projet s'ajoute.
const technologies = [...new Set(projets.flatMap(p => p.tags))]

// Image de partage (Open Graph, Twitter, JSON-LD). Elle passe par la même
// pipeline que la photo du hero plutôt que de pointer sur public/photo.jpg :
// la source est une photo d'appareil de plusieurs mégaoctets, que chaque
// aperçu de lien téléchargerait intégralement. useImage() garde l'URL
// synchronisée avec la configuration du module, au lieu de figer un chemin
// /_ipx/ que le moindre changement de réglage casserait en silence.
const img = useImage()
const cheminApercu = img('/photo.jpg', { width: 1200, height: 1200, fit: 'cover', quality: 75 })
// URL absolue exigée par Open Graph. Le chemin porte déjà le baseURL, d'où la
// résolution relative à l'origine du site plutôt qu'une concaténation.
const urlApercu = new URL(cheminApercu, siteUrl).href

const donneesStructurees = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': profil.nom,
  'jobTitle': profil.titre,
  'description': profil.accroche,
  'url': siteUrl,
  'image': urlApercu,
  'email': `mailto:${profil.email}`,
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Petit-Mars',
    'addressRegion': 'Pays de la Loire',
    'addressCountry': 'FR',
  },
  'alumniOf': {
    '@type': 'CollegeOrUniversity',
    'name': 'IUT de Nantes',
  },
  'knowsAbout': technologies,
  // `sameAs` relie cette page aux profils qui décrivent la même personne.
  'sameAs': [profil.github, profil.linkedin],
}

useHead({
  meta: [
    { property: 'og:image', content: urlApercu },
    // Dimensions déclarées : sans elles, certaines plateformes affichent un
    // cadre vide le temps de télécharger l'image pour la mesurer.
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '1200' },
    { property: 'og:image:alt', content: `Portrait de ${profil.nom}` },
    { name: 'twitter:image', content: urlApercu },
    { name: 'twitter:image:alt', content: `Portrait de ${profil.nom}` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify(donneesStructurees),
  }],
})
</script>

<template>
  <div>
    <a href="#contenu" class="skip-link">Aller au contenu</a>
    <SiteNav />
    <NuxtPage id="contenu" />
    <SiteFooter />
    <RetourHaut />
    <PaletteCommandes />
    <TechSprite />
  </div>
</template>
