<script setup lang="ts">
// Coquille commune à toutes les sections : l'ancre, le conteneur centré,
// l'eyebrow et le titre. Le corps passe par le slot par défaut. Centraliser
// cet échafaudage garantit que toute nouvelle section est cohérente d'office.
import { numeroSection } from '~/sections/registry'

const props = defineProps<{
  id: string
  eyebrow: string
  title: string
}>()

// Rattache la section à son propre titre : sans nom accessible, un <section>
// est exposé comme une « région » anonyme et la navigation par régions des
// lecteurs d'écran devient inutilisable. useId() garantit un identifiant
// stable entre le rendu serveur et l'hydratation.
const idTitre = useId()

// Numéro dérivé du registre : réordonner les sections renumérote tout seul.
const numero = computed(() => numeroSection(props.id))
</script>

<template>
  <section :id="id" class="section" :aria-labelledby="idTitre">
    <div class="container">
      <p v-reveal class="reveal eyebrow">
        <!-- Numéro purement décoratif : il donne un repère visuel, mais un
             lecteur d'écran qui annoncerait « zéro deux parcours » n'y
             gagnerait rien. -->
        <span class="eyebrow__num" aria-hidden="true">{{ numero }}</span>
        <span class="eyebrow__trait" aria-hidden="true" />
        {{ eyebrow }}
      </p>
      <h2 :id="idTitre" v-reveal="60" class="reveal section-title">{{ title }}</h2>
      <slot />
    </div>
  </section>
</template>
