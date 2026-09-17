---
title: Oki — Android client
key: oki
locale: en
hidden: false
featured: true
year: 2026
role: Android engineer
stack: [Kotlin, Jetpack Compose, RevenueCat, Google Play]
tagline: Took a language-learning app's Android client from nothing to a stable production release.
order: 2
---

## Problem

The product was iOS-first with an existing user base, and Android was still
on the roadmap. The Android client had to match the iOS feature set, run its
own subscription flow, and pass Google Play review without breaking the
monetization that the marketing spend depended on.

## Approach

- Built the Android client in Kotlin with Jetpack Compose, matching the iOS
  information architecture instead of inventing a second one
- Wired subscriptions through RevenueCat, including re-attribution on login
  so purchases made during signup attach to the right account
- Fixed purchase reporting for signup-funnel purchases
- Kept the store listing honest about which languages the app actually
  supported

## Outcome

- Production release live on Google Play, version 1.0.2
- 400 to 800 daily active users
- Crash rate 0.27 percent and ANR rate 0.11 percent, both well inside Google
  Play's bad-behavior thresholds
- Subscription attribution issues closed in the 1.0.2 release

## What I learned

- Billing is where Android releases actually break. The screens are the easy
  part; attribution is the part that costs money.
- A store listing is a promise. If it claims languages the product does not
  have, the reviews will say so publicly, and they will be right.
- Release work is dependency work. Store access, billing accounts, and review
  timelines gate the schedule more than the code does, so getting those
  unblocked early is part of the engineering job, not admin around it.
