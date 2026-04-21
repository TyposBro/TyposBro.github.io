import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // `key` is the stable cross-locale identifier (e.g. "agent-vault").
    // Astro auto-derives `slug` from the filename; we need our own
    // identifier so we can pair the EN + KO + RU + UZ versions of the
    // same project together.
    key: z.string(),
    locale: z.enum(['en', 'ko', 'ru', 'uz']),
    hidden: z.boolean().default(false),
    featured: z.boolean().default(false),
    year: z.number(),
    role: z.string(),
    stack: z.array(z.string()),
    tagline: z.string(),
    repo: z.string().url().optional(),
    npm: z.string().url().optional(),
    demo: z.string().url().optional(),
    order: z.number().default(100),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // `key` is the stable cross-locale identifier — see projects schema.
    key: z.string(),
    locale: z.enum(['en', 'ko', 'ru', 'uz']),
    date: z.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
  }),
});

export const collections = { projects, posts };
