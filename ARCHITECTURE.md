# typosbro.github.io — architecture

## Stack

- **Astro 5.x** — static site generator, ships ~0 JS by default
- **Tailwind CSS v4** — styling
- **Astro Content Collections** — projects, case studies, blog posts (MDX)
- **astro-i18n / built-in i18n** — EN / KO / RU / UZ routing
- **GitHub Actions** — build + deploy to GitHub Pages on push to main

Why Astro over alternatives:

- Next.js static export: overkill, ships React runtime even for static
- Hugo: Go templates less ergonomic than JSX/MD
- 11ty: first-class but i18n is manual
- Plain HTML: ruled out by i18n + blog + case studies requirement
- Jekyll: default GitHub Pages, but outdated DX + Ruby dependency

## File tree

```
typosbro-site/
├── astro.config.mjs             # i18n config (EN default, KO/RU/UZ)
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deploy
├── public/
│   ├── resume-en.pdf
│   ├── resume-ko.pdf
│   ├── favicon.svg
│   └── og-default.png
├── src/
│   ├── config.ts                 # Site-wide feature flags (show Spiko/Brivva)
│   ├── content/
│   │   ├── config.ts             # Zod schemas for projects + posts
│   │   ├── projects/
│   │   │   ├── spiko.en.md       # unlocked 2026-09-17 (F-2-7 granted)
│   │   │   ├── spiko.ko.md
│   │   │   ├── spiko.ru.md
│   │   │   ├── spiko.uz.md
│   │   │   ├── brivva.en.md      # archived, open source
│   │   │   ├── brivva.ko.md
│   │   │   ├── brivva.ru.md
│   │   │   ├── brivva.uz.md
│   │   │   ├── uzpay.en.md
│   │   │   ├── uzpay.ko.md
│   │   │   ├── uzpay.ru.md
│   │   │   ├── uzpay.uz.md
│   │   │   ├── agent-vault.en.md
│   │   │   ├── agent-vault.ko.md
│   │   │   ├── agent-vault.ru.md
│   │   │   └── agent-vault.uz.md
│   │   └── posts/                # blog (optional, empty for now)
│   ├── i18n/
│   │   ├── en.json               # UI strings: "Projects", "About", "Resume"
│   │   ├── ko.json
│   │   ├── ru.json
│   │   └── uz.json
│   ├── layouts/
│   │   ├── Base.astro            # HTML skeleton + <html lang=>, meta, og
│   │   └── Project.astro         # Case-study layout
│   ├── components/
│   │   ├── Nav.astro             # Nav + language switcher
│   │   ├── Footer.astro
│   │   ├── ProjectCard.astro     # Card for home-page grid
│   │   ├── LanguageSwitcher.astro
│   │   ├── Hero.astro
│   │   └── SkillGrid.astro
│   ├── pages/
│   │   ├── index.astro           # redirects to /en/ (or browser lang)
│   │   ├── en/
│   │   │   ├── index.astro       # home
│   │   │   ├── about.astro
│   │   │   ├── projects/
│   │   │   │   ├── index.astro   # list all (filtered by hidden flag)
│   │   │   │   └── [slug].astro  # dynamic per-project case study
│   │   │   ├── blog/
│   │   │   │   ├── index.astro
│   │   │   │   └── [slug].astro
│   │   │   └── contact.astro
│   │   ├── ko/                   # mirror structure
│   │   ├── ru/
│   │   └── uz/
│   ├── styles/
│   │   └── global.css            # Tailwind v4 + custom tokens
│   └── assets/                   # images, illustrations
└── README.md
```

## Routing strategy

- `/` — redirects to `/en/` (browser language negotiation via Accept-Language)
- `/en/` — home
- `/ko/` — Korean home
- `/en/projects/uzpay` — English project page
- `/ko/projects/uzpay` — Korean project page
- Language switcher preserves current path across locales

## i18n strategy

Astro 5+ has built-in i18n. Use:

```js
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: true  // /en/ is explicit, /ko/ etc. mandatory
    },
    fallback: {
      ko: 'en',
      ru: 'en',
      uz: 'en',
    }
  }
});
```

- UI strings live in `src/i18n/*.json` — component imports the
  right one based on `Astro.currentLocale`
- Content (projects, posts) has per-locale Markdown files:
  `uzpay.en.md`, `uzpay.ko.md`, etc. Content collection schema
  requires a locale field
- Fallback: if a Korean version of a post doesn't exist yet, show
  English with a banner "Available in English only"

## Feature flags (per-project visibility)

Per-project frontmatter flag:

```yaml
---
title: Spiko
hidden: true          # flip to false to publish
locale: en
---
```

Build-time filter in `pages/*/projects/index.astro`:

```js
const allProjects = await getCollection('projects', ({ data }) =>
  !data.hidden
);
```

Hidden projects do not get rendered pages (404 if someone guesses URL).
One-line flip in each project's MD + rebuild = live.

Alternative: single global flag in `src/config.ts`:

```ts
export const SHOW_HIDDEN_PROJECTS = false;
```

Both work. Per-project is more surgical. History: Spiko and Brivva were both
hidden behind the F-2-7 visa gate. Spiko was unlocked when the visa was granted,
Brivva when its archived code went open source, both on 2026-09-17. The global
list in `src/config.ts` is currently empty.

## Content shapes

**Project frontmatter (Zod-validated):**

```yaml
---
title: uzpay
slug: uzpay
locale: en
hidden: false
featured: true
year: 2024
role: Solo builder
stack: [TypeScript, Hono, Cloudflare Workers]
tagline: "Payment gateways for Uzbekistan (Payme/Click/Paynet) with zero dependencies."
repo: https://github.com/TyposBro/uzpay
npm: https://www.npmjs.com/package/uzpay
demo: null
order: 3                  # manual ordering
---

# markdown body — problem, approach, outcome, screenshots...
```

**Case study structure:**

1. Problem (why this exists)
2. Approach (architecture, tradeoffs)
3. Outcome (metrics, reception, lessons)
4. Selected code/screenshots (optional)

## GitHub Pages deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deploy
```

After first push: GitHub Settings → Pages → Source = GitHub Actions.

## Migration plan from existing repo

1. Clone existing `TyposBro.github.io` locally to `typosbro-site-old/`
2. Build new site in `typosbro-site/` (this dir)
3. Salvage any copy / images / PDFs from old
4. Test locally (`npm run dev`)
5. Push new site to the existing `TyposBro.github.io` repo, replacing contents on main branch
6. GitHub Action deploys automatically
7. DNS / Pages settings stay unchanged (still served at typosbro.github.io)

## Content roadmap

- **v0.1 (shell):** EN only, all 4 project stubs, no blog posts.
  Agent-vault + uzpay visible. Spiko + Brivva hidden. Resume PDF link.
- **v0.2 (KO):** Korean translations of all visible content.
  Korean language switcher functional.
- **v0.3 (project case studies):** Long-form writeups per project.
  agent-vault first (most topical — people clicking from Twitter).
- **v0.4 (RU + UZ):** Other locales. Lower priority since primary
  audience is EN/KO.
- **v0.5 (blog):** First post. Probably "why I built agent-vault"
  or the Brivva ffmpeg incident (without naming Brivva yet).
- **v1.0 (F-2-7 unhide):** Flip Spiko + Brivva flags. Add detailed
  case studies for both.

## Out of scope (explicitly)

- Server-side rendering / dynamic content
- Authentication / admin panel
- Analytics beyond plain GitHub Pages stats (can add Plausible post-launch)
- CMS (Markdown in repo is the CMS)
- Comments on blog posts (stay frictionless)
