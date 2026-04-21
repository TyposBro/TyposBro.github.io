---
title: Why I built agent-vault
key: why-i-built-agent-vault
locale: en
date: 2026-04-21
draft: false
tags: [oss, ai, tools]
excerpt: Switching from Claude Code to Codex taught me I didn't actually own my agent memory. Same context, four files, drift from day one. So I built one markdown vault that exports to any agent format.
---

I've been using Claude Code for most of 2026. It has this feature
where it remembers things between sessions — a kind of persistent
memory. You tell it once "I prefer tabs over spaces" or "we're on
Cloudflare Workers for backend" and it keeps that in a `CLAUDE.md`
file at the repo root.

A few weeks ago I tried Codex. Same idea: reads from `AGENTS.md`.

And Gemini CLI reads from `GEMINI.md`.

And there's a `CODEX.md` convention too, for good measure.

**Same context. Four files. Drifting from day one.**

That's not memory. That's lock-in with extra steps.

## The moment

It happened during a normal day at Brivva, the live-commerce
translation startup I co-founded. I was mid-task, wanted to switch
to Codex because I'd heard it was faster for a specific flow. I
type `codex` instead of `claude`, it boots up, and immediately I
realize — it doesn't know who I am. It doesn't know we're on
Cloudflare Workers. It doesn't know the repo's clean architecture
rules. None of that context transferred.

So I have three choices:

1. Re-explain everything to Codex from scratch (20 minutes per
   project, many projects)
2. Copy `CLAUDE.md` to `AGENTS.md` (brittle — now any edit has to
   be done in both places, and eventually one drifts)
3. Symlink `AGENTS.md` to `CLAUDE.md` (fragile on Windows, fragile
   on cross-machine sync, still doesn't help when a third agent
   shows up)

I picked option 3 for about a day, then it broke on a machine I
don't use often, and I realized — **this is a solved problem,
just not by anyone yet.**

## What the solve actually looks like

You want:

- **One markdown file** you edit. Call it whatever. Something like
  `AGENT.md` — singular, generic.
- **Symlinks** from every agent's expected filename to that single
  file. `CLAUDE.md → AGENT.md`. `AGENTS.md → AGENT.md`. `CODEX.md
  → AGENT.md`. New agent shows up with a new convention? Add one
  more symlink. Done.
- **Git** as the source of truth. No hosted backend. No vendor
  account. No subscription. Your memory moves with your repo.
- **Obsidian-compatible** layout (optional but nice) — the same
  markdown files I'm using as agent memory, I can also read and
  edit in Obsidian like I would any other notes.

That's it. No ML. No embeddings. No vector DB. Just filesystem
plumbing and the good sense to not hand every tool vendor my
context to hold hostage.

I wrote it up in a weekend. Called it **agent-vault**.

[`github.com/TyposBro/agent-vault`](https://github.com/TyposBro/agent-vault)

## Why not hosted memory services

A bunch of startups have popped up offering "AI memory as a service"
— hosted backends that every agent can query. I understand the
appeal. Centralized memory, queryable, auto-synced.

I'm not taking that bet, and neither should you. Here's why:

- **Your memory is sensitive.** It knows your stack, your code
  style, your product decisions. Sometimes your visa status,
  your compensation, your team dynamics. You don't hand that to
  a service that might pivot, get acquired, or die in 18 months.
- **The "integration" is the whole pitch.** Hosted memory needs
  every agent vendor to integrate. Some will, some won't. The
  ones that won't are ironically the most interesting ones (local
  LLMs, CLI tools, open-source agents).
- **Git already solved this.** Git was designed for exactly this:
  distributed, versioned, offline-capable plain-text storage.
  Hosted memory services are a strictly worse Git with a
  subscription attached.
- **Vendor lock-in is the actual problem.** If you replace
  Claude's format-specific lock-in with a hosted-memory vendor's
  API lock-in, you haven't solved anything. You've just moved the
  dependency.

Local-first, git-backed, provider-neutral is the shape. Agent-vault
picks that shape and commits to it.

## What it looks like in practice

My setup:

```
~/claude-memory/           # the vault (git repo, mirrored to GitHub + GitLab)
├── shared/                # cross-project memory — user facts, feedback, rules
│   ├── user_visa_timeline.md
│   ├── feedback_execute_dont_instruct.md
│   ├── rules_race_prevention.md
│   └── ...
├── brivva/                # project-specific memory
│   ├── MEMORY.md
│   ├── project_brivva_ffmpeg_librtmp.md
│   └── ...
├── spiko/
├── stonelab/
├── prep/
└── sync-project.sh        # the magic: symlinks into every project root
```

When I start a new project, I add it to `projects.txt`, run
`./sync-all.sh`, and the vault auto-wires into the project:

- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CODEX.md` in the repo
  root — all symlinks to a single generated `AGENT.md` file
- Shared memory symlinked into the project's memory directory
- `MEMORY.md` regenerated with shared + project-scoped entries

Every agent reads the same source. If I add a rule to `shared/`, it
auto-propagates to every project on next sync. When I switch
agents, the new one reads the same file the old one did. Zero
context loss.

## What's next

agent-vault is tiny on purpose. ~10 files, ~300 lines of bash, no
dependencies. I'm not planning to turn it into a platform. It
should work the same way in a year that it works today.

A few things I'm considering:

- A CLI to scaffold a new project entry without editing
  `projects.txt` by hand
- Templates for common project types (web app, mobile, Rust
  backend) so new project memory starts with sensible
  defaults
- A "race surface audit" integration (asking the agent to
  run through a checklist of concurrency risks when it first
  touches a project — covered in my rules file, works by
  convention today)

But the core shape is done. The next version might add a feature
or two; it won't change what agent-vault is.

## Takeaway

If you're using more than one AI coding agent — or think you might
in the next year, which, given how fast this space is moving,
you probably will — **you own your memory**. Don't let a vendor's
filename convention or a hosted service's API decide what stays
with you.

It's just markdown. Keep it in git. Symlink out to wherever. Move
on.

---

*Source code: [github.com/TyposBro/agent-vault](https://github.com/TyposBro/agent-vault). Feedback welcome on [Twitter](https://twitter.com/typosbro).*
