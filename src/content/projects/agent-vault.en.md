---
title: agent-vault
key: agent-vault
locale: en
hidden: false
featured: true
year: 2026
role: Solo author
stack: [TypeScript, Markdown, Git, Astro]
tagline: One markdown memory vault for every AI coding agent. Local-first, git-backed, provider-neutral.
repo: https://github.com/TyposBro/agent-vault
order: 4
---

## Problem

Every AI coding tool wants its own memory format — `CLAUDE.md`,
`AGENTS.md`, `CODEX.md`, `GEMINI.md`. Same context, duplicated across
four files, drifting from day one. Moving from one agent to another
means re-teaching the agent who I am and what I'm building.

That's not memory. That's lock-in with extra steps.

## Approach

- One markdown vault owned by the user
- Git as source of truth (versioned, mirrored, offline-first)
- Generated exports to any agent format via a single sync script
- Shared + per-project scoping (shared facts auto-appear in every
  project; per-project memory stays private to that repo)
- GitHub + GitLab dual-push for outage resilience

Under the hood, `sync-project.sh` symlinks the four canonical
filenames (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CODEX.md`) to a
single generated `AGENT.md` per project, so every CLI reads from the
same source without me maintaining copies.

## Outcome

- Solo-developed in ~2 days during a Claude Code ↔ Codex switch
- OSS on GitHub, private variant on GitLab
- Caught adoption from early tryers after launch tweet
- Replaced my previous ad-hoc memory-management cron that drifted
  silently between tools

## What I learned

- Provider-neutral is a shape, not a feature — it happens at the
  sync-script boundary, not inside the memory files
- Agents will read whatever filename is in the root, so giving them
  a stable symlink beats negotiating with every vendor's format
- Local-first + git-backed is table stakes for anything that carries
  my context; hosted memory services are a bet I'm not taking
