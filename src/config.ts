// Site-wide configuration.
//
// Keep the list of hidden projects here. Frontmatter per-project can
// override via its own `hidden: true` field — that's the primary
// mechanism. This array is a backup / global kill switch used by
// pages that filter projects in a single place.

export const SITE = {
  name: 'Azizbek Umidjonov',
  title: 'Azizbek Umidjonov — Software engineer in Seoul',
  description:
    'Android and full-stack engineer in Seoul. I ship mobile apps end to end and stay until the release is live and stable. Available for remote contract work.',
  url: 'https://typosbro.github.io',
  email: 'khasanjonovich@gmail.com',
  github: 'https://github.com/TyposBro',
  twitter: 'https://x.com/typosbro63199',
  linkedin: 'https://www.linkedin.com/in/typosbro54/',
} as const;

// Projects currently gated. Spiko was unlocked 2026-09-17 once the F-2-7
// resident visa was granted. Brivva stays hidden until Aziz confirms it is
// public-safe. Per-project frontmatter `hidden: true` still applies
// independently, so both mechanisms must be off for display.
export const HIDDEN_PROJECT_SLUGS = ['brivva'] as const;

export const LOCALES = ['en', 'ko', 'ru', 'uz'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ru: 'Русский',
  uz: 'Oʻzbekcha',
};
