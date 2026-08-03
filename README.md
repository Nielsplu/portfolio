# Portfolio — Niels Plu

[![CI/CD](https://github.com/Nielsplu/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Nielsplu/portfolio/actions/workflows/ci.yml)

Portfolio one-page en **Nuxt 4** (Vue 3, TypeScript), sans dépendance CSS externe, prêt pour **GitHub Pages**.

En ligne : <https://nielsplu.github.io/portfolio/>

## Architecture

Pensée pour évoluer facilement : le contenu est séparé du schéma, les sections
sont des modules autonomes, et un registre unique pilote l'ordre d'affichage et
la navigation.

```
app/
├── types/content.ts        Schéma : interfaces du contenu (Profil, Projet…)
├── content/                Contenu, un fichier par domaine
│   ├── profil.ts
│   ├── parcours.ts
│   ├── projets.ts
│   ├── competences.ts
│   └── index.ts            Barrel : les composants importent depuis '~/content'
├── sections/registry.ts    SOURCE UNIQUE de l'ordre des sections ET de la nav
├── components/
│   ├── base/               Primitives réutilisables (BaseSection, TechList…)
│   ├── layout/             SiteNav, SiteFooter, ThemeToggle
│   └── sections/           Une section = un composant (HeroSection, …)
├── composables/
│   ├── useScrollSpy.ts     Surbrillance du lien de la section visible
│   └── useTheme.ts         Bascule clair / sombre
├── demos/                  Démos interactives embarquées (registre + modules)
│   ├── index.ts            Registre des démos (chargement paresseux)
│   └── ftp/                Démo FTP : le vrai binaire Go tourne en WebAssembly
├── utils/filtres.ts        Helpers génériques testés
├── assets/css/             Design system : tokens → base → components
└── pages/index.vue         Rend les sections du registre

public/
├── photo.jpg               Ta photo
├── cv/CV_Niels_PLU.pdf     Ton CV
└── demos/ftp/              Assets de la démo wasm (binaire, données)
```

## Étendre le site

**Modifier un contenu** (texte, projet, compétence, parcours) : éditer le
fichier concerné dans `app/content/`. Rien d'autre à toucher.

**Ajouter un projet** : ajouter une entrée dans `app/content/projets.ts`.
Champs : `titre`, `sousTitre`, `description`, `tags`, `categorie`, `liens?`, `demo?`.

**Ajouter une section** (ex. « Blog », « Open source ») :
1. créer `app/components/sections/BlogSection.vue` (s'appuyer sur `<BaseSection>`) ;
2. l'ajouter à `app/sections/registry.ts`, à la position voulue.

Elle apparaît dans la page, et — si l'entrée porte un libellé `nav` — dans le
menu, **sans toucher ni la page ni la navigation**.

**Ajouter une démo interactive** : créer `app/demos/<id>/`, l'inscrire dans
`app/demos/index.ts`, puis mettre `demo: '<id>'` sur le projet concerné.

**Rethemer** : tout passe par les variables de `app/assets/css/tokens.css`.

## Thème clair / sombre

Le site suit la **préférence système** par défaut, et le visiteur peut forcer
l'un ou l'autre via le bouton de la barre de navigation ; son choix est
mémorisé. Trois pièces s'articulent :

| Pièce | Rôle |
|---|---|
| `assets/css/tokens.css` | Les deux palettes. La sombre surcharge la claire sous `:root[data-theme='dark']`, et sous `@media (prefers-color-scheme: dark)` pour les visiteurs sans JavaScript. |
| Script en `<head>` (`nuxt.config.ts`) | Résout le thème **avant le premier paint** et le pose sur `<html data-theme>` : aucun clignotement au chargement. |
| `composables/useTheme.ts` | Lit et écrit cet attribut au clic. |

Deux détails qui ont demandé du soin, à ne pas défaire par inadvertance :

- **L'interrupteur ne tient aucun état réactif.** Position du repère et libellé
  sont choisis en CSS d'après `data-theme`. Le serveur ne pouvant pas connaître
  le thème du visiteur, tout état rendu côté serveur provoquerait un écart
  d'hydratation. Les deux options restent visibles, un repère coulissant
  marquant celle en vigueur : l'état se lit sans avoir à interpréter une icône
  unique.
- **Les transitions sont coupées le temps de la bascule** (`motion.css`, attribut
  `data-theme-bascule`). Sans cela, une propriété à la fois transitionnée et
  alimentée par une variable de thème reste figée sur son ancienne couleur —
  Chrome ne recalcule pas le point d'arrivée d'une transition quand c'est le
  `var()` source qui change. Symptôme observé : bouton primaire resté bleu clair
  sur fond sombre, texte sombre par-dessus, illisible.

Les deux thèmes ont été mesurés : 21 paires texte/fond conformes au **niveau AA**
(contraste minimum relevé 4,97:1).

## Accessibilité & SEO

- **Régions nommées** : chaque `<section>` porte un `aria-labelledby` pointant
  sur son propre titre, via `useId()`. Sans nom accessible, une section est
  exposée comme une région anonyme et la navigation par régions des lecteurs
  d'écran devient inutilisable.
- **Menu mobile** : le libellé du burger suit son état (« Ouvrir » / « Fermer »),
  la touche Échap referme le menu et redonne le focus au bouton.
- **Données structurées** `schema.org/Person` (JSON-LD, dans `app.vue`) : nom,
  intitulé, formation, localisation, et `sameAs` vers GitHub et LinkedIn. Les
  technologies sont dérivées des tags de projets, donc jamais désynchronisées.

## Détails d'expérience

- **Copie de l'adresse e-mail** (`usePressePapiers`) en complément du lien
  `mailto:`, qui ne mène à rien pour qui n'a pas de client mail configuré. Le
  bouton garde une largeur fixe pour ne pas décaler ses voisins en changeant de
  libellé, et l'issue — succès **comme échec** — est annoncée dans une région
  `aria-live` : le nom accessible d'un élément déjà focalisé n'est pas réannoncé
  de façon fiable.
- **Retour en haut** (`RetourHaut`), un lien vers l'ancre d'accueil et non un
  bouton : le défilement doux vient du CSS (donc neutralisé par
  `prefers-reduced-motion`) et l'ancre reste utilisable au clavier. Masqué tant
  qu'on n'a pas descendu un écran, avec `visibility`, `tabindex` et
  `aria-hidden` — sinon il resterait cliquable et atteignable en étant invisible.
- **Compteur de résultats** sous les filtres de projets, en `aria-live` : le
  filtre ne signalait pas son effet, et un lecteur d'écran ne voit pas les
  cartes disparaître.
- **`codePrive`** sur un projet affiche « Code privé » au lieu de ne rien
  afficher : une carte sans aucune action laisse croire à un lien oublié.
- Les liens externes annoncent « (nouvel onglet) » aux lecteurs d'écran.

## Page 404

`app/error.vue` couvre les erreurs, et **`/404.html` est prérendu** : GitHub
Pages sert ce fichier pour toute adresse inconnue. Sans lui, une URL erronée
tombait sur la page 404 générique de GitHub.

Ce fichier est une coquille SPA : l'app démarre côté client puis affiche la page
d'erreur. Le retour à l'accueil est donc un **vrai lien** et non un bouton
appelant `clearError` — un clic arrivé avant la fin de l'hydratation échouait
(`NUXT_E1005`), course impossible avec un lien, qui de surcroît fonctionne sans
JavaScript et au clic milieu.

## Animations d'apparition

La directive `v-reveal` (`app/plugins/reveal.ts`) observe l'entrée dans la vue.
**La classe `reveal` s'écrit dans le template**, elle n'est pas injectée par
`getSSRProps` : injectée côté serveur seulement, elle manquait au vnode client
et Vue signalait un écart d'hydratation sur chaque élément animé — la console se
remplissait à chaque chargement. Le délai, absent du template, peut lui rester
dans `getSSRProps` sans être comparé.

## Démarrer

Le projet utilise **pnpm** (version épinglée dans `package.json`). Avec
Corepack (fourni par Node), pas besoin de l'installer à la main :

```bash
corepack enable
nvm install && nvm use
pnpm install
pnpm dev             # http://localhost:3000
```

## Qualité

```bash
pnpm test            # tests (Vitest)
pnpm test:coverage   # idem + couverture et seuils
pnpm lint            # ESLint
pnpm typecheck       # vérification TypeScript
```

### Couverture

Deux niveaux d'exigence plutôt qu'une moyenne qui ne dit rien — les seuils
vivent dans `vitest.config.ts` et font échouer la CI.

| | Instructions | Branches | Fonctions | Lignes |
|---|---:|---:|---:|---:|
| Utilitaires (`app/utils`) | 97,6 % | 94,7 % | 100 % | 100 % |
| Composables (`app/composables`) | 95,7 % | 90,3 % | 93,9 % | 98,7 % |
| Composants | 35,5 % | 28,1 % | 27,7 % | 38,1 % |
| Démos | 17,4 % | 20,1 % | 14,8 % | 17,7 % |

La logique — utilitaires purs et composables — est tenue haut : c'est là que
vivent les règles, et elle se teste sans compromis. Le seuil global n'est qu'un
cliquet contre la régression : `demos/ftp/wasm.ts` et `DemoFtpTerminal.vue`
pèsent à eux seuls 41 % du code mesuré et ne se testent pas hors du navigateur,
le premier pilotant un binaire Go et le second s'appuyant dessus. Les exclure
gonflerait le chiffre sans rien prouver ; ils restent comptés, à découvert
assumé.

Le détail par lot s'affiche sur la page de chaque run GitHub Actions
(`scripts/resume-couverture.mjs`), sans service tiers ni jeton.

### Budget de poids

`scripts/budget-poids.mjs` mesure ce qui transite réellement — gzippé — et fait
échouer la CI au-delà des plafonds :

| | Mesuré | Plafond |
|---|---:|---:|
| HTML de l'accueil | 34,9 Ko | 40 Ko |
| JavaScript total | 113,5 Ko | 130 Ko |
| CSS total | 11,3 Ko | 15 Ko |
| Plus gros paquet JS | 98,4 Ko | 115 Ko |

Environ 15 % de marge : assez pour ne pas casser au premier ajustement, trop
peu pour laisser passer une dépendance entière. Relever un plafond est une
décision à prendre après `npx nuxi analyze`, pas un réflexe quand ça coince.

Les tests qui montent des composants tournent sous `// @vitest-environment
nuxt`, ce qui donne accès aux auto-imports et à `useState`. `happy-dom` ne
calcule ni disposition ni media queries : une régression purement visuelle ou
responsive leur échappe.

## CI/CD

Un pipeline unique (`.github/workflows/ci.yml`) enchaîne trois étapes, chacune
barrière de la suivante :

```
qualité (lint · types · tests) ─▶ build statique ─▶ déploiement Pages
```

- **Pull request** : qualité + build (validation, sans déploiement).
- **Push sur `main`** : qualité + build + déploiement sur GitHub Pages.

Rien n'est déployé si le lint, les types, les tests ou le build échouent. La
version de Node vient de `.nvmrc`, celle de pnpm de `package.json`, les installs
sont reproductibles (`pnpm install --frozen-lockfile`), et le setup commun est
factorisé dans une action composite (`.github/actions/setup`).

### Contribuer

La branche `main` est protégée : **toute modification passe par une pull
request** validée par la CI, aucun push direct (règle appliquée à tout le monde,
y compris au propriétaire). Le flux :

```bash
git switch -c ma-modif
# … modifications …
git commit -am "..." && git push -u origin ma-modif
gh pr create --fill          # ouvre la PR
gh pr merge --auto --squash  # fusionnera dès que la CI est verte
```

La PR ne peut être fusionnée que si `Qualité (lint · types · tests)` et
`Build statique` passent.

### Mises à jour automatiques

Dependabot ouvre chaque semaine des PR de mise à jour groupées. Elles sont
**fusionnées automatiquement** dès que la CI passe, via
`.github/workflows/dependabot-auto-merge.yml` et la protection de branche : une
mise à jour qui casse la qualité ou le build reste ouverte au lieu d'atteindre
`main`. Aucune intervention manuelle nécessaire.

### Mise en place (une fois)

1. Repo `portfolio` sur GitHub, pousser sur `main`.
2. Settings → Pages → Source : **GitHub Actions**.

Le site est servi sur `https://nielsplu.github.io/portfolio/`. Si le repo a un
autre nom, changer `baseURL` dans `nuxt.config.ts`.
