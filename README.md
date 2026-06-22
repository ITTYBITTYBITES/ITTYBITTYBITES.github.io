# Liquid Memory Website

Public GitHub Pages website for **Liquid Memory** — a gaming and entertainment hub featuring browser arcade experiments, studio content, and the flagship **2 Second Witness** experience.

Live site:

- https://ittybittybites.github.io/
- https://ittybittybites.github.io/website/

## Public repository policy

This repository is treated as a public/static publication repository. Anything committed here should be safe to expose publicly and safe to serve through GitHub Pages.

Keep in this repo:

- Static website pages and assets
- Browser-playable games
- Public content data used to generate pages
- Public build scripts required by GitHub Actions
- Public sitemap, robots, ads/app-ads files

Do not commit here:

- Private credentials, tokens, keys, or account secrets
- Private backend notes, internal deployment reports, or unpublished strategy docs
- Local-only scripts that are not required by the public site or GitHub Actions build
- Raw private source files that should not be visible to visitors or crawlers

## Build

The automated GitHub Actions workflow runs:

```bash
npm ci
node website/build-engine.js
```

Local validation:

```bash
npm test
npm run build
```

## Public structure

```text
/                       Root redirect, robots, app-ads, package files
.github/workflows/      Public GitHub Actions build workflow
website/                Public website, games, assets, generated pages, build data
website/games/          Browser-playable games
website/assets/         Shared brand system and browser assets
website/articles/       Public articles
website/library/        Generated public resource pages
website/intel/          Generated public intel pages
```
