---
title: uzpay
key: uzpay
locale: ko
hidden: false
featured: true
year: 2024
role: 단독 개발
stack: [TypeScript, Hono, Zero-dependency]
tagline: 우즈베키스탄 결제 서비스(Payme, Click, Paynet) 통합 라이브러리. 의존성 0, 런타임 중립.
repo: https://github.com/TyposBro/uzpay
npm: https://www.npmjs.com/package/uzpay
order: 3
---

## 문제

우즈베키스탄 결제 시장은 세 주요 provider(Payme, Click, Paynet)로
파편화되어 있으며, API가 일관성 없고 서명 방식이 다르며, 통합된
TypeScript 클라이언트가 없습니다. 모든 현지 e-commerce 프로젝트가
같은 glue code를 처음부터 다시 만듭니다.

## 접근

- 런타임 의존성 0 — Node, Bun, Deno, Cloudflare Workers,
  브라우저 모두에서 동작
- provider별 adapter를 일관된 인터페이스 뒤에 두고 하나의 API surface
- 런타임 중립 crypto (Web Crypto API만 사용, Node 전용 모듈 없음)
- Zod 기반 response 파싱으로 강하게 타입 지정

## 결과

- npm에 퍼블리시, 주당 ~80 다운로드
- 여러 우즈베키스탄 e-commerce 프로젝트에서 production 사용 중
- Zero-dep 제약이 공급망 위험을 제거 — 보안 팀이 좋아함

## 배운 것

- 런타임 중립은 크로스 플랫폼보다 어렵지만 유지보수가 훨씬 저렴
- Zero-dependency는 feature — 보안 팀에 스스로 팔림
- 작고 집중된 라이브러리가 framework보다 오래 감; uzpay의 API는
  v1부터 안정적으로 유지되고 있음
