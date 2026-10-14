# HANDOFF — "My Girlfriend's Dead" animated fan music video

You are receiving a task with **zero prior context**. Everything you need is below.

> **Which repo you are in.** This file is committed to
> `typosbro/typosbro.github.io` (**public**). That repo holds only the **published**
> copy of the cartoon, under `public/girlfriends-dead/` — the files the website
> actually serves.
>
> The **full working tree** — offline MP4 renderer, contact-sheet tools, Whisper
> transcript generator, local audio — lives in a **separate private repo**,
> `typosbro/agent-memory`, under `vandals-mv/`. Every path in *Relevant files*
> below is written relative to `vandals-mv/`; inside this repo the film files sit
> at `public/girlfriends-dead/`, and the `tools/` directory does not exist.

---

## Task

Finish and ship a funny, fast-paced animated music video for The Vandals' song
"My Girlfriend's Dead" (161s), then deploy the web version to the user's personal
site.

**The animation is finished and both hosts are live on it** — see *Current state*.
What is still open is a **link from the site to the cartoon** (it is reachable only
by typing `/girlfriends-dead/`) and an optional pacing tweak.

The animation itself is complete and rendered. Do not rewrite it unless the user
asks. Verify it first, then change it.

---

## Context

- The song is **"My Girlfriend's Dead"** by **The Vandals**.
  YouTube: `https://www.youtube.com/watch?v=O8Sl_-reaBo` (duration 161s).
- The user wanted "something like" an existing official animated video by BlankTV
  (`https://www.youtube.com/watch?v=wrULozjHqkI`) but with **"more gags and jokes"**.
  **Do not copy that video's artwork or gags.** This is an original fan remake.
- The video must **tell the song's story through visuals, synced to the real
  phrasing**. Earlier versions failed because the story was wrong and the pacing
  was slow.

### The song's actual story (this is the whole premise — get it right)

A guy gets **dumped**. He can't admit that, so he tells everyone his girlfriend
**died**. Each retelling the cause of death gets **more outrageous** (an illness →
a worse illness → a truck). Somewhere in there he realises he **loves the sympathy**
and starts milking it. The bridge reveals the whole thing is a lie: she simply
likes someone else now.

**Arc:** embarrassed/reluctant liar → embellisher → sympathy addict.

**Not** part of the story: "she keeps showing up alive" (an earlier invention, cut
by the user), and **he does not haul a corpse around** (that was the v1 mistake).

### Legal constraints (do not break these)

- **Never display or render the song's lyrics.** Captions are original words only.
- **Do not commit or publish the audio file, or a song-baked MP4, to a public site.**
  The web version **must** use the **YouTube IFrame Player API** as its audio
  source and drive the animation from `player.getCurrentTime()`.
- The local MP3 and the rendered MP4 are **personal-use only**. Uploading a
  song-baked video to YouTube would be Content ID-claimed.
- `tools/.transcript.json` is a private Whisper transcript — **git-ignored. Never
  publish or render it.** It was used only to measure phrase timings.

---

## Relevant files

Root: `/home/typosbro/agent-memory/vandals-mv/`

### Source (the film)
- `src/shots.js` — **the shot list as data.** 36 shots with `from`/`to` in song
  seconds, an `id`, and a `set`. Exports `SHOTS`, `shotAt(t)`. This is the spine.
- `src/gags.js` — **the comedy.** One function per shot id in a `GAGS` map;
  `drawGag(ctx, id, tLocal, len)` dispatches. ~1200 lines. All staging lives here.
- `src/stage.js` — 10 reusable backdrops: `park(pen,t,{sepia})`, `livingRoom`,
  `doorway`, `bar`, `office`, `hospital`, `bathroom`, `street`, `rooftop`,
  `graveyard`. Each paints a full 1280×720 frame.
- `src/props.js` — 21 props (`couch`, `bench`, `truck`, `coffin`, `dog`,
  `heartMonitor`, `scaleProp`, `framedPortrait`, `medal`, `trumpet`, `drum`, …).
  **Note:** `trumpet`, `drum`, `medal`, `scaleProp` are **centre-anchored** on
  `(x,y)`; everything else is ground/base-anchored.
- `src/char.js` — the rigged flat-2D character. `defaultPose(o)`, `drawChar(pen,P,pal)`,
  palettes `PAL.punk` / `PAL.punkB` / `PAL.gf`, `HEAD_R = 46`, hip sockets.
  Face modes: eyes `normal|wide|dead|x|happy|closed|spiral|heart|dollar`;
  mouth `flat|smile|frown|grin|o|bigo|smirk|wave|teeth`. Hair: `spike|mohawk|bob|long|bald`.
- `src/bits.js` — comedy FX primitives: `snapZoom, shake, burst, ding, sparkles,
  sweat, stink, flies, heartPop, brokenHeart, skull, gravestone, coffin,
  spotlight, puff, tumbleweed, bubble`.
- `src/engine.js` — the `Pen` drawing API, easing helpers, `setCamera`, `posterText`.
  `Pen.line` had a bug (drew nothing) that is now fixed — do not reintroduce it.
- `src/scenes.js` — **entry point.** Exports `drawFrame(ctx,t)`, `DURATION` (160.99),
  `BPM` (172.27), `BEAT`, `BAR`, `FIRST_BEAT` (0.232), `sceneAt(t)`, `SHOTS`.
- `src/main.js` — the website: YouTube IFrame player + canvas loop + UI.
- `src/player.js`, `index.html`, `src/style.css` — site plumbing.

### Tools
- `tools/render.mjs` — offline MP4 renderer.
  `node tools/render.mjs <out.mp4> [fps=30]` (env `LIMIT=<seconds>` for smoke tests).
  Pipes raw frames into ffmpeg and muxes `assets/audio/mygirlfriendsdead.mp3`.
- `tools/frames.mjs` — contact-sheet renderer. `node tools/frames.mjs [t1,t2,..] [out.png]`.
  With no args it renders one representative frame per shot.
- `tools/transcribe.py` — private phrase-timing transcript generator
  (`WHISPER_VAD=0` was required; VAD returned 0 segments). Its output
  `tools/.transcript.json` is git-ignored.

### Assets / docs
- `assets/audio/mygirlfriendsdead.mp3` — local song copy. **Git-ignored. Never publish.**
- `SCRIPT.md` — the full written shot-by-shot script (36 shots).
- `README.md`, `LICENSE` (MIT).

### Website repo (separate working copy)
- `/tmp/opencode/site` — clone of `git@github.com:TyposBro/TyposBro.github.io.git`
  (branch `main`). **Deployment target is `public/girlfriends-dead/`.**

---

## Current state

### Done and working
- **v2 animation is complete.** 36 shots covering the full 161s, all rendering
  without exceptions. Verified by rendering a full contact sheet and inspecting it.
- **Rendered MP4 exists:** `/tmp/opencode/gfd_v2.mp4`
  — h264 + aac, 1280×720, 30fps, **160.99s**, 12 MB, 4830 frames. Non-blank.
- **Delivered to the user's Mac** (`macbook-2:~/Desktop/`):
  `My Girlfriends Dead - cartoon v2 (fan).mp4` and `My Girlfriends Dead - v2 shots.png`.
- `SCRIPT.md` written.
- Site sync is **done** — `public/girlfriends-dead/` is on v2 and pushed.

### Deployed
- **`typosbro.github.io/girlfriends-dead/`** — live on **v2**. Commit `558e192`
  on `main`; GitHub Actions builds `dist/` and publishes it (~1 min).
- **`typosbro.me/girlfriends-dead/`** — live on **v2**. Before this it returned a
  redirect to the homepage: the cartoon had never been deployed there. See the
  Cloudflare section below — this is the trap.

### Both hosts now auto-deploy from `main`
- **`typosbro.github.io`** — GitHub Actions (`.github/workflows/deploy.yml`) builds
  `dist/` and publishes it.
- **`typosbro.me`** — the Cloudflare Pages project **`typosbro-me`** is now
  **git-connected** to `TyposBro/TyposBro.github.io`: production branch `main`,
  build command `npm run build`, output `dist`, root directory empty (= repo root).
  A push builds and deploys automatically. Verified end to end: commit `558e192`
  triggered a build that went `clone_repo → build → deploy` in ~6s.

  **One source of truth, two hosts. No manual `wrangler pages deploy` is needed
  any more.** The old manual step was only necessary because the project's
  **Git Provider** was *No* — a Pages project in that state silently never
  updates. The tell: with *No*, `typosbro.me/<missing-path>` 302s to the
  homepage, which is exactly why the cartoon looked like it had vanished.

  Two things must stay true:
  1. The Pages **root directory stays empty** (repo root), so `functions/`
     is bundled. Without functions, `/` loses the edge rewrite to `/en/` and
     every first visit flashes the meta-refresh stub in `src/pages/index.astro`.
  2. Pushes to `main` stay the production branch for both hosts.

### Discoverability (done)
- The cartoon is now a **`projects` collection entry**: commit `e3f5747` adds
  `src/content/projects/girlfriends-dead.{en,ko}.md` (`order: 50`,
  `featured: false`, `demo: https://typosbro.me/girlfriends-dead/`).
- Live case-study pages: `/en/projects/girlfriends-dead/` and `/ko/...`, plus
  `/ru/` and `/uz/` via the English fallback that those two indexes implement.
- EN **and** KO files are both required — `src/pages/en/projects/index.astro` and
  `.../ko/projects/index.astro` filter strictly on `data.locale === locale`, with
  no fallback. Only `ru` and `uz` fall back to English.

### Known quirk (unchanged, but now visible)
- The homepage project grids are **headed "Featured projects" but select every
  project**: `src/pages/{en,ko,ru,uz}/index.astro` filter on `!data.hidden` only
  and never on `data.featured`. So the cartoon also appears in the homepage grid.
- To hide it there without touching the client work, add `&& data.featured` to
  those four `getCollection` filters. All four client projects are
  `featured: true`, so nothing else changes.

### Timing facts (measured from the real vocal phrasing)
```
instrumental intro            0.00 – 8.56
verse 1                       8.56 – 19.20
chorus 1                     20.22 – 28.74
verse 2 (the death stories)  31.52 – 42.00
chorus 2                     42.90 – 51.96
verse 3 (he likes it)        54.56 – 64.02
chorus 3                     65.86 – 74.90
bridge (the truth)           76.04 – 86.46
chorus 4 (reunion reel)      87.56 – 98.46
verse 1 reprise             100.28 – 109.70
instrumental break          109.70 – 117.80
final chorus / outro        117.80 – 149.48
instrumental outro          149.48 – 160.99
```

---

## What was tried

- **v1** — 10 scenes of 8–25s each. **Failed**: wrong premise (he hauls a corpse
  around, which is not the song), guessed bar-based timing, almost no gags.
  The user said it was "lagging and not good" and that "the lyrics and actions
  don't match". v1 is what is **currently live on the site**.
- **"She keeps showing up alive" running gag** — invented for density; the user
  rejected it. Removed.
- **Two `luna-fast` subagents** were launched to build `stage.js` and `props.js`.
  The first attempt at each **returned without creating any file**. Retrying with
  a "write the file first, then refine" instruction worked. **Lesson: always
  require a self-verifying artifact (a rendered contact sheet + reading the PNG)
  and verify the file exists before trusting a subagent.**
- Several staging bugs were found by rendering and *looking at* frames, then fixed:
  duplicate furniture (the backdrops already contain couches/benches/desks),
  a bathroom "scale" that read as a giant clock, a banner and a podium drawn over
  the hero's head, a coffin lid that read as a floating plank.

---

## Decisions

- **Rigged flat-2D canvas** (not hand-drawn frames, not three.js). Scenes are pure
  functions of time, so one renderer feeds both the live site and the offline MP4.
- **Shot-based timeline** (~36 shots, avg ~4.5s) instead of long scenes, for pace.
- **Real phrase timings** from Whisper, not BPM maths.
- **Cartoon slapstick, no blood** — a head pops off and rolls like a bowling ball.
- **The 4th-wall smirk** and the **sympathy economy** are the recurring gags.
- **The bridge drops all gags on purpose** (desaturates, reveals the real reason).
- **Audio is never hosted** — YouTube embed on the web, local MP3 for personal renders.
- Git: the whole `vandals-mv/` source tree is **untracked** in
  `/home/typosbro/agent-memory`. Only the published files live in the site repo.

---

## Acceptance criteria

- [x] `/tmp/opencode/gfd_v2.mp4` still renders and plays (160.99s, video+audio).
- [x] `typosbro.github.io/girlfriends-dead/` serves **v2**, not v1.
- [x] The deployed site plays audio via the **YouTube embed** and the animation
      stays in sync with it.
- [x] **No lyrics appear anywhere on screen.** No audio file or song-baked MP4 is
      committed to the site repo.
- [x] The old v1 files are gone from `public/girlfriends-dead/` (in particular the
      stale `scenes.js`).
- [x] Build passes and the push is on `main` (`558e192`).
- [x] `typosbro.me` serves the same v2 build (git-connected Pages project).
- [x] A link to the cartoon exists on the site (`projects` entry, all locales).

---

## Constraints

- **Do not publish the song.** No MP3, no song-baked video in the repo. YouTube
  embed only.
- Do not reproduce the lyrics in code, captions, or docs.
- Do not copy the BlankTV reference video's art or gags.
- Keep the existing site's other pages untouched — only
  `public/girlfriends-dead/` should change.
- Do not delete `tools/.transcript.json` or `assets/audio/`; they are deliberately
  git-ignored working files.
- Access notes: deliver files to `macbook-2:~` via scp/ssh (the plain `macbook`
  host is offline). GitHub SSH auth works as `TyposBro`.

---

## The deploy procedure (already run — kept for reference)

Target: `/tmp/opencode/site/public/girlfriends-dead/`

The new version needs **12 files** (v1 had 7):

```
index.html
src/engine.js  src/char.js  src/bits.js   src/stage.js  src/props.js
src/shots.js   src/gags.js  src/scenes.js src/main.js   src/player.js
src/style.css
```

Steps:
1. Copy all 12 from `vandals-mv/` into `public/girlfriends-dead/`.
2. Confirm no stale files remain (v1's `scenes.js` must be overwritten).
3. `npm run build` in `/tmp/opencode/site` — must pass.
4. Sanity-check the built output contains `shots.js` and `gags.js`.
5. Commit and push to `main`.
6. Verify the live URL after Pages rebuilds.

---

## Open questions for the user

1. ~~**Discoverability**~~ — **done.** It is a `projects` entry on both hosts; see
   *Discoverability (done)* above.
2. **Pacing** — the three final outro shots run 9–12s each. The user was told to
   flag it if the last minute drags. If they do, split those shots in `shots.js`
   and add matching `GAGS` entries.
3. ~~**Cloudflare automation**~~ — **done.** `typosbro-me` is connected to
   `TyposBro/TyposBro.github.io`; a push to `main` deploys both hosts.

---

## Environment

- Linux. Node v24, ES modules. `@napi-rs/canvas` installed.
- `ffmpeg` / `ffprobe` available. `python3` available.
- `faster-whisper` 1.2.1 in `tools/.venv` (with numpy).
- Working directory: `/home/typosbro/agent-memory/vandals-mv`.
- Prefer `/tmp/opencode` for scratch files.
