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
│   ├── base/               Primitives réutilisables (BaseSection, TagList)
│   ├── layout/             SiteNav, SiteFooter
│   └── sections/           Une section = un composant (HeroSection, …)
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
pnpm test            # tests unitaires (Vitest)
pnpm lint            # ESLint
pnpm typecheck       # vérification TypeScript
```

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
