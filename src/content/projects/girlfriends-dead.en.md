---
title: "My Girlfriend's Dead — animated fan video"
key: girlfriends-dead
locale: en
hidden: false
featured: false
year: 2026
role: Everything — storyboard, character rig, props, animation, timing
stack: [Canvas 2D, Vanilla JS, YouTube IFrame API, Node]
tagline: A 161-second animated cartoon, drawn entirely in code and synced live to the song.
demo: https://typosbro.me/girlfriends-dead/
order: 50
---

## Problem

An unofficial music video for a two-and-a-half-minute punk song, built with no
animation software, no asset pipeline and no budget. It had to be funny, keep up
with a fast vocal, and stay on the right side of copyright — the song may not be
hosted anywhere I control.

The first attempt failed. It guessed the structure from the tempo, stretched ten
scenes across the runtime, and the joke did not land: the visuals drifted out of
step with the song, and every scene sat still for far too long.

## Approach

- **Measure the song instead of guessing it.** I ran the vocal through Whisper,
  read the real phrase boundaries off the transcript, and cut the timeline to
  those rather than to bar maths.
- **Shots, not scenes.** The video is 36 shots averaging about 4.5 seconds, so
  something on screen changes roughly every time a line does.
- **A character rig, not drawings.** Everything is flat-2D shapes on a canvas: a
  skeleton with hip sockets, a swappable head, and poseable limbs. One pose
  function drives every shot.
- **Scenes as pure functions of time.** `drawFrame(ctx, t)` maps global song time
  to a shot and draws it. The same code drives the live page and an offline MP4
  render, so there is exactly one version of the animation.
- **Audio stays on YouTube.** The page embeds the official player and reads
  `getCurrentTime()` every frame. Nothing is re-hosted, and no lyrics are ever
  rendered on screen.

## Outcome

- 36 shots covering the full 161 seconds, with no dead frames
- Renders to both the browser and a 1280×720 H.264 MP4 at 30fps from one source
- Deploys to two hosts from a single commit: GitHub Pages and Cloudflare Pages

## What I learned

- **Timing is the whole joke.** Every change that made this funny was a timing
  change. Getting real phrase boundaries out of the audio did more than any
  redraw.
- **Constraint pushed the design.** Because a scene is a pure function of time, I
  could scrub to any second and see it instantly. That made iterating cheap enough
  to actually iterate.
- **Keep the copyright line bright.** Fan work still has to respect the rights
  holder: stream the song from the official player, draw your own art, never
  reproduce the lyrics.

Watch it at [typosbro.me/girlfriends-dead](https://typosbro.me/girlfriends-dead/).
The source lives in the [site repository](https://github.com/TyposBro/TyposBro.github.io).
