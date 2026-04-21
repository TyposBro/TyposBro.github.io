---
title: Brivva Tech
key: brivva
locale: ko
hidden: true
featured: true
year: 2026
role: 공동창업자 + 테크 리드
stack: [Rust, Cloudflare Workers, AWS Fargate, Terraform]
tagline: 실시간 다국어 라이브 커머스 방송. 한 번의 방송, 여러 시장, 호스트의 목소리 유지.
order: 2
---

## 문제

한국 라이브 커머스 호스트는 중국, 일본, 동남아 청중에게 도달하고
싶어합니다 — 하지만 번역 옵션은 post-processed (라이브 순간을
잃음) 또는 자막만 (시청자는 번역 안 된 호스트를 스크롤로 지나감).
Prism 같은 기존 플랫폼은 방송을 처리; Dubly는 더빙을 처리. 아무도
호스트 본인의 복제된 음성으로, 라이브로, 동시에 두 가지를 하지 않습니다.

## 접근

- 호스트는 한 번 source 언어(한국어/영어)로 스트리밍
- server-rs 파이프라인(Rust + Axum + tokio)이 STT → 번역 →
  TTS를 호스트의 복제된 음성으로, target 언어마다 실행
- FFmpeg로 target마다 각 목적지에 맞는 자막이 burn-in된 인코딩
- 다중 플랫폼 동시 RTMP fan-out: Grip (한국 커머스), TikTok,
  YouTube — 한 번의 방송, N 플랫폼
- Cloudflare Workers + D1이 세션, 빌링 metric, OAuth 처리
- Soniox 실시간 STT + 네이티브 번역; ElevenLabs Flash v2.5로
  저지연 TTS

## 결과

- 2026년 5월 첫 B2B 방송자와 런칭
- 스케일 타겟: 10 클라이언트 × 3 언어 = source-min당 60 output-min,
  $1.50/output-min에 ~90% 마진
- 8 vCPU / 16 GB Fargate 태스크가 En → Ko+Zh+Ja + passthrough를
  Grip + TikTok + YouTube에서 동시에 처리
- 깔끔한 4-layer 아키텍처 (core → shared → features →
  orchestration) + 3-tier 테스팅 규율 (unit + integration + e2e)

## 배운 것

- 실시간 음성 번역은 연쇄된 네 개 failure point (STT / translate /
  TTS / RTMP) — 모든 단계의 observability가 필수
- Vendor별 인코더 quirk가 중요: AWS IVS는 네이티브 ffmpeg RTMP를
  거부하지만 librtmp는 수용; FFmpeg 7.1+가 drawtext-with-harfbuzz
  체인에 필요
- 수직 집중 (한국 라이브 커머스)이 수평 확장 (범용 "모두를 위한
  번역")을 이김 — 플랫폼별 통합이 moat, ML 모델이 아님
