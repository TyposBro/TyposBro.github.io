# typosbro.github.io

Personal site + portfolio for Azizbek Umidjonov. Astro + Tailwind v4.
i18n across English, Korean, Russian, Uzbek.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:4321/en/

## Build

```bash
npm run build
```

Output: `./dist/`

## Deploy

Push to `main`. GitHub Actions (see `.github/workflows/deploy.yml`)
builds + deploys to GitHub Pages.

**First-time setup:**
1. On GitHub → Settings → Pages → Source = **GitHub Actions**
2. Verify the Actions tab shows the `Deploy to GitHub Pages` workflow on next push

## Project visibility

- `src/config.ts` → `HIDDEN_PROJECT_SLUGS` — global list of projects
  gated from display. Flip to `[]` to reveal all.
- Per-project: `hidden: true` in the Markdown frontmatter. Either
  mechanism hides the project; both must be `false` for display.

Current hidden list: `spiko`, `brivva` (unhide after F-2-7 visa
lands).

## Adding a project

1. Create `src/content/projects/<slug>.en.md` with frontmatter
2. Copy to `<slug>.ko.md` / `.ru.md` / `.uz.md` and translate
3. Rebuild — project appears automatically in the home + projects
   pages for every locale that has a file

## i18n

UI strings in `src/i18n/{en,ko,ru,uz}.json`. Component imports the
right dictionary via `Astro.currentLocale`.

Content (projects, posts) has per-locale Markdown files. Missing
translations fall back to English per `astro.config.mjs`.

## Architecture

See `ARCHITECTURE.md` for the full design decisions, file tree,
migration plan, and content roadmap.
