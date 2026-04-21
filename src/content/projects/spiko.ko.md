---
title: Spiko English
key: spiko
locale: ko
hidden: true
featured: true
year: 2022
role: 단독 개발
stack: [Kotlin, Jetpack Compose, Next.js, Cloudflare Workers]
tagline: 혼자 만든 영어 학습 앱. 10만+ 다운로드, 62K MAU, 수익성 확보.
demo: https://play.google.com/store/apps/details?id=com.spiko.english
order: 1
---

## 문제

중앙아시아의 영어 학습 앱 대부분은 서구 시장의 콘텐츠를 그대로
로컬라이제이션해서, 우즈벡/러시아어 화자에게 특화된 문법 pain point를
놓치고 있습니다. 상위 랭킹 앱들도 현지 가격에 맞지 않는 구독을 요구합니다.

## 접근

- 안드로이드 우선, Jetpack Compose + Clean Architecture
- 오프라인 우선 컨텐츠 전달; 커리큘럼은 인터넷 없이도 동작
- 네이티브 언어 drift 패턴(러시아어/우즈벡어 → 영어)에 캘리브레이션된
  간격 반복 엔진
- Google Play 국가별 SKU를 통한 현지화된 가격
- 분석 기반 페이월 실험 (10+ variant A/B 테스트)

## 결과

- 100,000+ 다운로드
- 62,000 MAU, 7,300 DAU
- 99.9% 크래시 없는 세션
- 수익성 확보; 평균 세션 44분
- 앱 수명 동안 ~1,320 커밋

## 배운 것

- 수익을 내는 앱을 혼자 만들면 모든 레이어를 똑같이 신경 쓰게 됨 —
  느린 DB 쿼리 하나가 실제로 돈이 됨
- 코호트 기반 기능 결정이 gut feel을 이김; 페이월 A/B로 전환율
  20%+ 상승
- 평균 44분 세션은 콘텐츠 + 간격 반복 loop이 동작한다는 신호;
  그 metric을 최우선으로 최적화
