import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',

    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: 'coverage',

      // Le contenu (profil, projets, parcours…) est de la donnée, pas de la
      // logique : l'inclure gonflerait le chiffre sans rien prouver. Le
      // registre des démos et celui des sections ne font que ré-exporter.
      include: ['app/**/*.{ts,vue}'],
      exclude: [
        'app/content/**',
        'app/types/**',
        'app/demos/index.ts',
        'app/sections/registry.ts',
        'app/app.vue',
        '**/*.test.ts',
      ],

      // Deux niveaux d'exigence plutôt qu'une moyenne qui ne dit rien.
      //
      // La logique — utilitaires purs et composables — est tenue haut : c'est
      // là que vivent les règles, et elle est testable sans compromis.
      //
      // Le seuil global, lui, n'est qu'un cliquet : il empêche la couverture de
      // baisser sans imposer de course au pourcentage. Il reste bas parce que
      // wasm.ts et DemoFtpTerminal.vue pèsent à eux seuls 41 % du code mesuré
      // et ne se testent pas hors du navigateur — le premier pilote un binaire
      // Go, le second s'appuie dessus. Les exclure gonflerait le chiffre sans
      // rien prouver ; ils restent comptés, à découvert assumé.
      thresholds: {
        statements: 39,
        branches: 35,
        functions: 38,
        lines: 40,

        'app/utils/**': {
          statements: 97,
          branches: 95,
          functions: 100,
          lines: 100,
        },
        'app/composables/**': {
          statements: 95,
          branches: 92,
          functions: 92,
          lines: 96,
        },
      },
    },
  },
})
