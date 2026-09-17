import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://typosbro.github.io',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: true,
    },
    // Do NOT add a `fallback` map here. Astro's config-level fallback emits a
    // redirect stub for every default-locale route in every fallback locale,
    // and those stubs overwrite the pages our own templates generate, so
    // /ko/projects/spiko/ redirected to /en/ even though spiko.ko.md exists.
    // The per-locale templates already fall back to English content
    // themselves (see the getCollection filters in src/pages/*/projects and
    // src/pages/ru|uz/blog). Adding the map back reintroduces 15 dead pages.
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
