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

const donneesStructurees = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': profil.nom,
  'jobTitle': profil.titre,
  'description': profil.accroche,
  'url': siteUrl,
  'image': `${siteUrl}photo.jpg`,
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
  </div>
</template>
