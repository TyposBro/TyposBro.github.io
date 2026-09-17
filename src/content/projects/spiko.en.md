---
title: Spiko English
key: spiko
locale: en
hidden: false
featured: true
year: 2022
role: Solo builder
stack: [Kotlin, Jetpack Compose, Next.js, Cloudflare Workers]
tagline: AI English exam-prep app I built solo. 100K+ installs, 4.8 stars, cash-positive.
demo: https://play.google.com/store/apps/details?id=org.milliytechnology.spiko
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

- 100,000+ installs and 4.8 stars on Google Play
- 99.9% crash-free sessions
- Cash-positive after infrastructure, AI inference, platform fees and taxes
- 44-minute average session length
- ~1,320 commits over the lifetime

## What I learned

- Solo-shipping a revenue-generating app forces you to care about
  every layer equally — one slow DB query costs you real money
- Cohort-driven feature decisions beat gut feel; A/B'ing the
  paywall added 20%+ conversion uplift
- 44-minute average sessions tell you the content + spaced
  repetition loop is working; optimize for that metric first

Available on [Google Play](https://play.google.com/store/apps/details?id=org.milliytechnology.spiko) and the [App Store](https://apps.apple.com/us/app/spiko-ai-exam-prep/id6763239914).
