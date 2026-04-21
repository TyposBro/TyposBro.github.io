---
title: Brivva Tech
key: brivva
locale: en
hidden: true
featured: true
year: 2026
role: Co-founder + tech lead
stack: [Rust, Cloudflare Workers, AWS Fargate, Terraform]
tagline: Real-time multilingual live-commerce broadcasting. One stream, multiple markets, host's voice preserved.
order: 2
---

## Problem

Korean live-commerce hosts want to reach Chinese, Japanese, and
Southeast Asian audiences — but translation options are either
post-processed (loses the live moment) or captions-only (viewers
scroll past untranslated hosts). Existing platforms like Prism
handle broadcasting; Dubly handles dubbing. Nothing does both
live, at the same time, with the host's own cloned voice.

## Approach

- Host streams once in source language (Korean/English)
- Server-rs pipeline (Rust + Axum + tokio) runs STT → translation
  → TTS with the host's cloned voice, per target language
- FFmpeg per-target encodes with burned-in captions for each
  destination
- Multi-platform simultaneous RTMP fan-out: Grip (Korean
  commerce), TikTok, YouTube — one broadcast, N platforms
- Cloudflare Workers + D1 handle sessions, billing metrics, OAuth
- Soniox real-time STT with native translation; ElevenLabs Flash
  v2.5 for low-latency TTS

## Outcome

- Launched May 2026 with first B2B broadcaster
- Pipeline targets for scale: 10 clients × 3 languages = 60
  output-minutes per source-minute, ~90% margin at $1.50/output-min
- 8 vCPU / 16 GB Fargate task handles En → Ko+Zh+Ja +
  passthrough on Grip + TikTok + YouTube concurrently
- Clean 4-layer architecture (core → shared → features →
  orchestration) + three-tier testing discipline (unit +
  integration + e2e)

## What I learned

- Real-time voice translation is four chained failure points
  (STT / translate / TTS / RTMP) — observability at every stage
  is non-negotiable
- Vendor-specific encoder quirks matter: AWS IVS rejects native
  ffmpeg RTMP but accepts librtmp; FFmpeg 7.1+ is required for
  the drawtext-with-harfbuzz chain
- Vertical focus (Korean live commerce) beats horizontal sprawl
  (generic "translation for everyone") — specific platform
  integrations are the moat, not the ML model
