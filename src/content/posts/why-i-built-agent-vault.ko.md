---
title: agent-vault를 만든 이유
key: why-i-built-agent-vault
locale: ko
date: 2026-04-21
draft: false
tags: [oss, ai, tools]
excerpt: Claude Code에서 Codex로 옮기면서 제 에이전트 메모리가 실제로는 제 소유가 아니었다는 걸 깨달았습니다. 같은 컨텍스트, 네 개 파일, 첫날부터 drift. 그래서 어떤 에이전트 포맷으로든 export되는 하나의 마크다운 볼트를 만들었습니다.
---

2026년 대부분 Claude Code를 써왔습니다. 세션 간에 기억을 유지하는
기능이 있는데 — 일종의 지속 메모리입니다. "tab 대신 space를 선호해"
또는 "우린 Cloudflare Workers 백엔드야"라고 한 번 말하면 repo 루트의
`CLAUDE.md` 파일에 저장됩니다.

몇 주 전 Codex를 시도해봤습니다. 같은 아이디어: `AGENTS.md`를 읽습니다.

Gemini CLI는 `GEMINI.md`를 읽습니다.

그리고 `CODEX.md` 관례도 있습니다, 덤으로.

**같은 컨텍스트. 네 개 파일. 첫날부터 drift.**

이건 메모리가 아닙니다. 이건 lock-in에 단계만 추가한 것입니다.

## 깨달은 순간

Brivva에서 평범한 하루를 보내던 중 일어났습니다 — 제가 공동창업한
라이브 커머스 번역 스타트업입니다. 작업 중에 Codex로 전환하고 싶어서
`claude` 대신 `codex`를 입력했고, 부팅되자마자 알아차렸습니다 — 제가
누군지 모릅니다. Cloudflare Workers를 쓴다는 것도 모릅니다. repo의
clean architecture 규칙도 모릅니다. 그 어떤 컨텍스트도 전달되지 않았습니다.

선택지는 세 개:

1. Codex에 모든 걸 처음부터 다시 설명 (프로젝트당 20분, 여러 프로젝트)
2. `CLAUDE.md`를 `AGENTS.md`로 복사 (취약함 — 편집은 양쪽에 해야 하고
   결국 하나가 drift)
3. `AGENTS.md`를 `CLAUDE.md`로 symlink (Windows, 크로스 머신 동기화에
   취약; 세 번째 에이전트가 나타나면 여전히 도움 안 됨)

하루 정도 3번을 썼다가, 자주 안 쓰는 머신에서 망가졌고 깨달았습니다 —
**이건 누군가 이미 풀었어야 할 문제인데 아직 아무도 안 풀었구나.**

## 진짜 해결책은 어떻게 생겼는가

이게 필요합니다:

- **편집하는 마크다운 파일 하나.** 이름은 뭐든. `AGENT.md` 같은 —
  단수형, 범용.
- **모든 에이전트의 예상 파일명에서 그 파일로 가는 symlink들.**
  `CLAUDE.md → AGENT.md`. `AGENTS.md → AGENT.md`. 새로운 컨벤션의
  새로운 에이전트가 등장? symlink 하나 더 추가. 끝.
- **Git이 진실의 원천.** hosted 백엔드 없음. 벤더 계정 없음. 구독
  없음. 메모리가 repo와 함께 움직입니다.
- **Obsidian 호환** 레이아웃 (선택이지만 좋음) — 에이전트 메모리로
  쓰는 같은 마크다운 파일들을 Obsidian에서 다른 노트처럼 읽고 편집할
  수 있음.

그게 전부입니다. ML 없음. 임베딩 없음. 벡터 DB 없음. 그냥 파일시스템
플러밍과, 모든 tool 벤더에게 제 컨텍스트를 인질로 주지 않을 정도의
상식.

주말 하나 만에 썼습니다. **agent-vault**라고 이름 붙였습니다.

[`github.com/TyposBro/agent-vault`](https://github.com/TyposBro/agent-vault)

## hosted 메모리 서비스는 왜 안 쓰는가

"서비스로서의 AI 메모리"를 제공하는 스타트업이 여럿 나타났습니다 —
모든 에이전트가 쿼리할 수 있는 hosted 백엔드. 매력은 이해합니다.
중앙집중식 메모리, 쿼리 가능, 자동 동기화.

저는 그 베팅을 하지 않고, 여러분도 안 했으면 합니다. 이유:

- **메모리는 민감합니다.** 스택, 코드 스타일, 제품 결정을 압니다.
  때로는 비자 상태, 보상, 팀 역학까지. 18개월 안에 pivot하거나
  인수되거나 사라질 수 있는 서비스에 그런 걸 맡기지 않습니다.
- **"통합"이 제품의 전부입니다.** Hosted 메모리는 모든 에이전트
  벤더가 통합해야 작동. 안 하는 쪽이 아이러니하게도 가장 흥미로운
  쪽 (로컬 LLM, CLI 도구, 오픈소스 에이전트).
- **Git이 이미 풀었습니다.** Git은 정확히 이걸 위해 설계됐습니다:
  분산, 버전 관리, 오프라인 가능한 plain-text 저장소. Hosted 메모리
  서비스는 구독이 붙은 엄격히 더 나쁜 Git입니다.
- **Vendor lock-in이 실제 문제입니다.** Claude의 포맷별 lock-in을
  hosted-memory 벤더의 API lock-in으로 대체하면 아무것도 안 푼
  겁니다. 그냥 의존성을 옮긴 것뿐.

로컬 우선, git 백업, 프로바이더 중립이 올바른 형태. Agent-vault는
그 형태를 선택하고 커밋합니다.

## 다음은

agent-vault는 의도적으로 작습니다. 파일 ~10개, bash ~300줄, 의존성
없음. 플랫폼으로 만들 계획 없습니다. 1년 후에도 오늘과 같은 방식으로
동작해야 합니다.

## 요약

AI 코딩 에이전트를 둘 이상 쓰고 있거나, 앞으로 1년 안에 쓸 것 같다면 —
이 분야가 얼마나 빠르게 움직이는지 보면 대체로 그럴 겁니다 —
**여러분이 메모리를 소유합니다.** 벤더의 파일명 컨벤션이나 hosted
서비스의 API가 여러분과 함께 남을 것을 결정하게 두지 마세요.

그냥 마크다운입니다. Git에 두세요. 필요한 곳으로 symlink하세요. 넘어갑니다.

---

*소스 코드: [github.com/TyposBro/agent-vault](https://github.com/TyposBro/agent-vault). 피드백 환영합니다 [Twitter](https://twitter.com/typosbro).*
