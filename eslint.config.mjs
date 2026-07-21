// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Les composants (SiteNav, SiteHero…) sont déjà préfixés par convention.
    'vue/multi-word-component-names': 'off',
  },
})
