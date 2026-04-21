---
title: Spiko English
key: spiko
locale: en
hidden: true
featured: true
year: 2022
role: Solo builder
stack: [Kotlin, Jetpack Compose, Next.js, Cloudflare Workers]
tagline: English learning app I built solo. 100K+ downloads, 62K MAU, profitable.
demo: https://play.google.com/store/apps/details?id=com.spiko.english
order: 1
---

## Problem

English learning apps in Central Asia largely localize content
from Western markets, missing the grammar pain points specific to
Uzbek/Russian speakers. The top-ranked apps also require
subscriptions that aren't accessible at local pricing.

## Approach

- Android-first with Jetpack Compose + Clean Architecture
- Offline-first content delivery; syllabus works without internet
- Spaced repetition engine calibrated for native-language drift
  patterns (Russian/Uzbek → English)
- Localized pricing via Google Play country-specific SKUs
- Analytics-driven paywall experiments (A/B tested 10+ variants)

## Outcome

- 100,000+ downloads
- 62,000 MAU, 7,300 DAU
- 99.9% crash-free sessions
- Profitable; 44-minute average session length
- ~1,320 commits over the lifetime

## What I learned

- Solo-shipping a revenue-generating app forces you to care about
  every layer equally — one slow DB query costs you real money
- Cohort-driven feature decisions beat gut feel; A/B'ing the
  paywall added 20%+ conversion uplift
- 44-minute average sessions tell you the content + spaced
  repetition loop is working; optimize for that metric first
