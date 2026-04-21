---
title: agent-vault
key: agent-vault
locale: ko
hidden: false
featured: true
year: 2026
role: 단독 개발
stack: [TypeScript, Markdown, Git, Astro]
tagline: 모든 AI 코딩 에이전트를 위한 하나의 마크다운 메모리 볼트. 로컬 우선, Git 백업, 프로바이더 중립.
repo: https://github.com/TyposBro/agent-vault
order: 4
---

## 문제

모든 AI 코딩 도구가 자신만의 메모리 포맷을 원합니다 — `CLAUDE.md`,
`AGENTS.md`, `CODEX.md`, `GEMINI.md`. 같은 컨텍스트가 네 개 파일에
복사되어 첫날부터 drift가 시작됩니다. 한 에이전트에서 다른 에이전트로
옮길 때마다 제가 누구고 무엇을 만들고 있는지 다시 가르쳐야 합니다.

이건 메모리가 아닙니다. 이건 lock-in에 단계만 추가한 것입니다.

## 접근

- 사용자가 소유하는 하나의 마크다운 볼트
- Git을 진실의 원천으로 (버전 관리, 미러링, 오프라인 우선)
- 하나의 sync 스크립트로 모든 에이전트 포맷으로 export
- 공유 + 프로젝트별 스코핑 (공유 facts는 모든 프로젝트에
  자동으로 나타남; 프로젝트별 메모리는 해당 repo에만 private)
- GitHub + GitLab dual-push으로 outage 저항성

내부적으로 `sync-project.sh`가 표준 파일명(`AGENTS.md`, `CLAUDE.md`,
`GEMINI.md`, `CODEX.md`) 네 개를 프로젝트마다 생성된 하나의
`AGENT.md`로 symlink합니다. 그래서 모든 CLI가 같은 소스에서
읽으며, 저는 사본을 관리할 필요가 없습니다.

## 결과

- Claude Code ↔ Codex 전환 중 ~2일간 단독 개발
- GitHub에 OSS, GitLab에 private 변형 배포
- 런칭 트윗 이후 초기 시도자들의 채택 확인
- 도구 간 silent drift가 있던 기존 ad-hoc 메모리 관리 cron을 대체

## 배운 것

- 프로바이더 중립은 기능이 아니라 형태 — sync-script 경계에서
  일어나며 메모리 파일 내부에서는 아님
- 에이전트는 root에 있는 어떤 파일명이든 읽으니, 각 벤더의 포맷과
  협상하기보다 stable한 symlink를 주는 게 낫다
- 로컬 우선 + git 백업은 내 컨텍스트를 담는 것의 기본 조건;
  hosted 메모리 서비스는 내가 걸지 않는 베팅
