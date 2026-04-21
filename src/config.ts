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
    'Software engineer building consumer + infrastructure products end-to-end. Seoul. E-7 visa, open to Korean tech.',
  url: 'https://typosbro.github.io',
  email: 'typosbro@proton.me',
  github: 'https://github.com/TyposBro',
  twitter: 'https://x.com/typosbro63199',
  linkedin: 'https://www.linkedin.com/in/typosbro54/',
} as const;

// Projects currently gated (e.g. Spiko + Brivva hidden until F-2-7).
// Flip to [] once visa target is achieved. Per-project frontmatter
// `hidden: true` still applies independently.
export const HIDDEN_PROJECT_SLUGS = ['spiko', 'brivva'] as const;

export const LOCALES = ['en', 'ko', 'ru', 'uz'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ru: 'Русский',
  uz: 'Oʻzbekcha',
};
