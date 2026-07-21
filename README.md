# Portfolio — Niels Plu

Portfolio one-page en **Nuxt 4** (Vue 3, TypeScript), sans dépendance CSS externe, prêt pour **GitHub Pages**.

## Structure

```
app/
├── data/portfolio.ts     ← TOUT le contenu est ici (profil, parcours, projets, compétences)
├── assets/css/main.css   ← design tokens (couleurs, typos)
├── components/           ← une section = un composant
└── pages/index.vue
public/
├── photo.jpg             ← ta photo (à ajouter)
└── cv/CV_Niels_PLU.pdf   ← ton CV (déjà inclus)
```

## Démarrer

```bash
nvm install && nvm use
npm install
npm run dev          # http://localhost:3000
```

## Déployer sur GitHub Pages

1. Crée un repo `portfolio` sur GitHub et pousse ce dossier sur `main`
2. Dans le repo : Settings → Pages → Source : **GitHub Actions**
3. Le workflow `.github/workflows/deploy.yml` build et déploie automatiquement à chaque push

Le site sera sur `https://nielsplu.github.io/portfolio/`.
Si le repo a un autre nom, change `baseURL` dans `nuxt.config.ts`.

## À personnaliser

- [ ] Ajouter `public/photo.jpg` (photo carrée, ~600×600)
- [ ] Vérifier/compléter les liens des projets dans `app/data/portfolio.ts`
- [ ] Ajouter un lien LinkedIn dans `profil` si tu en as un
