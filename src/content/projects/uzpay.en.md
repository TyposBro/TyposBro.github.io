---
title: uzpay
key: uzpay
locale: en
hidden: false
featured: true
year: 2024
role: Solo author
stack: [TypeScript, Hono, Zero-dependency]
tagline: Payment integration for Uzbekistan providers (Payme, Click, Paynet). Zero dependencies, runtime-agnostic.
repo: https://github.com/TyposBro/uzpay
npm: https://www.npmjs.com/package/uzpay
order: 3
---

## Problem

Uzbekistan's payment market is fragmented across three dominant
providers (Payme, Click, Paynet) with inconsistent APIs, different
signing schemes, and no unified TypeScript client. Every local
e-commerce project rebuilds the same glue code from scratch.

## Approach

- Zero runtime dependencies — works in Node, Bun, Deno, Cloudflare
  Workers, and the browser
- One surface API across providers, with per-provider adapters
  behind a consistent interface
- Runtime-agnostic crypto (Web Crypto API only, no Node-specific
  modules)
- Strongly typed with Zod-backed response parsing

## Outcome

- Published to npm, ~80 weekly downloads
- Used in production by multiple Uzbek e-commerce projects
- Zero-dep constraint eliminates supply-chain concerns — auditors
  love it

## What I learned

- Runtime-agnostic is harder than cross-platform but much cheaper
  to maintain
- Zero-dependency is a feature — it sells itself to security teams
- Small, focused libraries outlast frameworks; uzpay's API has been
  stable since v1
