/*
 * shots.js — THE SHOT LIST.
 *
 * This is the film, as data. One entry per comedic beat. Boundaries come from
 * the real vocal phrasing of the song (measured with tools/transcribe.py), not
 * guessed bars — that is the whole point.
 *
 * The story, per the song: a guy gets dumped, can't admit it, tells everyone
 * she's dead, invents an increasingly outrageous cause of death, and slowly
 * discovers he LOVES the sympathy.
 *
 * Timing facts worth keeping:
 *   - instrumental intro            0.00 - 8.56
 *   - verse 1                       8.56 - 19.20
 *   - chorus 1                     20.22 - 28.74
 *   - verse 2 (the death stories)  31.52 - 42.00
 *   - chorus 2                     42.90 - 51.96
 *   - verse 3 (he likes it)        54.56 - 64.02
 *   - chorus 3                     65.86 - 74.90
 *   - bridge (the truth)           76.04 - 86.46
 *   - chorus 4                     87.56 - 98.46
 *   - verse 1 reprise             100.28 - 109.70
 *   - instrumental break          109.70 - 117.80
 *   - final chorus / outro        117.80 - 149.48
 *   - instrumental outro          149.48 - 160.99
 */

export const ACT = {
  INTRO: 0,
  VERSE1: 1,
  CHORUS1: 2,
  VERSE2: 3,
  CHORUS2: 4,
  VERSE3: 5,
  CHORUS3: 6,
  BRIDGE: 7,
  CHORUS4: 8,
  REPRISE: 9,
  BREAK: 10,
  OUTRO: 11,
};

/**
 * id       unique gag id (implementation lives in gags.js)
 * from/to  song seconds
 * set      backdrop + props the gag expects (see stage.js / props.js)
 * beat     downbeat index this shot lands on, for reference
 */
export const SHOTS = [
  /* -------------------------------------------------------------- intro -- */
  { id: 'intro-phone',    from: 0.00,  to: 3.20, set: 'livingRoom', note: 'waits by the phone, hopeful' },
  { id: 'intro-door',     from: 3.20, to: 6.20, set: 'doorway',    note: 'neighbour asks where she is' },
  { id: 'intro-title',    from: 6.20, to: 8.56, set: 'doorway',    note: 'TITLE CARD slams in' },

  /* ----------------------------------------------------------- verse 1 -- */
  { id: 'v1-happy',       from: 8.56,  to: 12.00, set: 'park',     note: 'flashback: happy couple' },
  { id: 'v1-dumped',      from: 12.00, to: 15.00, set: 'park',     note: 'she leaves with another guy' },
  { id: 'v1-freeze',      from: 15.00, to: 19.20, set: 'doorway',  note: 'present: the question lands' },

  /* ----------------------------------------------------------- chorus 1 -- */
  { id: 'ch1-lie',        from: 20.22, to: 23.20, set: 'doorway',  note: 'first lie, blurts it out' },
  { id: 'ch1-reaction',   from: 23.20, to: 26.20, set: 'doorway',  note: 'huge cartoon grief' },
  { id: 'ch1-notice',     from: 26.20, to: 28.74, set: 'doorway',  note: 'he notices it WORKED' },

  /* ------------------------------------- verse 2: the escalating lies -- */
  { id: 'v2-lie-1',       from: 31.52, to: 34.70, set: 'hospital', note: 'death story 1: an illness' },
  { id: 'v2-lie-2',       from: 34.70, to: 37.90, set: 'bathroom', note: 'death story 2: worse' },
  { id: 'v2-lie-3',       from: 37.90, to: 42.00, set: 'street',   note: 'death story 3: the truck' },

  /* ----------------------------------------------------------- chorus 2 -- */
  { id: 'ch2-bar',        from: 42.90, to: 46.50, set: 'bar',      note: 'tells the bartender' },
  { id: 'ch2-scratch',    from: 46.50, to: 50.00, set: 'bar',      note: 'record scratch, room freezes' },
  { id: 'ch2-drink',      from: 50.00, to: 51.96, set: 'bar',      note: 'a free drink appears' },

  /* ------------------------------------------- verse 3: he likes it -- */
  { id: 'v3-queue',       from: 54.56, to: 57.70, set: 'office',   note: 'queue of comforting coworkers' },
  { id: 'v3-toohappy',    from: 57.70, to: 60.70, set: 'office',   note: 'he enjoys it a bit too much' },
  { id: 'v3-cards',       from: 60.70, to: 64.02, set: 'office',   note: 'buried in cards and flowers' },

  /* ----------------------------------------------------------- chorus 3 -- */
  { id: 'ch3-actout',     from: 65.86, to: 70.00, set: 'street',   note: 'he performs the death, miming it' },
  { id: 'ch3-procession', from: 70.00, to: 74.90, set: 'street',   note: 'veil, portrait, leads a march' },

  /* ------------------------------------------- bridge: the truth leaks -- */
  { id: 'br-mask',        from: 76.04, to: 79.70, set: 'street',   note: 'mask slips; the world desaturates' },
  { id: 'br-truth',       from: 79.70, to: 83.00, set: 'street',   note: 'the real reason: she likes someone else' },
  { id: 'br-ledge',       from: 83.00, to: 86.46, set: 'rooftop',  note: 'comic ledge windmill' },

  /* ------------------------------------------- chorus 4: reaction reel -- */
  { id: 'ch4-kid',        from: 87.56, to: 91.50, set: 'street',   note: 'tells a kid; kid salutes' },
  { id: 'ch4-oldlady',    from: 91.50, to: 95.00, set: 'street',   note: 'tells an old lady; she faints' },
  { id: 'ch4-dog',        from: 95.00, to: 98.46, set: 'street',   note: 'tells a dog; dog howls' },

  /* ------------------------------------------------------------ reprise -- */
  { id: 'rp-bench',       from: 100.28, to: 104.00, set: 'park',   note: 'the bench again, now empty' },
  { id: 'rp-neighbour',   from: 104.00, to: 106.60, set: 'park',   note: 'same neighbour, same question' },
  { id: 'rp-flourish',    from: 106.60, to: 109.70, set: 'park',   note: 'he delivers it with a flourish' },

  /* ------------------------------------------- break: pure physical -- */
  { id: 'bk-swoon',       from: 109.70, to: 113.70, set: 'livingRoom', note: 'swoons onto a couch; folds up' },
  { id: 'bk-support',     from: 113.70, to: 117.80, set: 'graveyard',  note: 'hosts a support group, he is the star' },

  /* --------------------------------------------- outro: the addiction -- */
  { id: 'out-mourners',   from: 117.80, to: 121.20, set: 'graveyard', note: 'crowd of mourners grows' },
  { id: 'out-tears', from: 121.20, to: 124.40, set: 'graveyard', note: 'he conducts the crying like an orchestra' },
  { id: 'out-autograph', from: 124.40, to: 127.30, set: 'graveyard', note: 'condolence cards become autograph requests' },
  { id: 'out-encore', from: 127.30, to: 130.00, set: 'graveyard', note: 'an encore of fake grief earns applause' },
  { id: 'out-procession', from: 130.00, to: 133.40, set: 'street',    note: 'full funeral procession, brass band' },
  { id: 'out-solo', from: 133.40, to: 136.80, set: 'street', note: 'the drummer steals his spotlight' },
  { id: 'out-conductor', from: 136.80, to: 140.20, set: 'street', note: 'he elbows back into the spotlight' },
  { id: 'out-coffin',     from: 140.20, to: 144.60, set: 'street',    note: 'the empty coffin rattles; a cat jumps out' },
  { id: 'out-cover', from: 144.60, to: 147.00, set: 'street', note: 'a suspicious mourner gets a theatrical distraction' },
  { id: 'out-bow', from: 147.00, to: 149.48, set: 'street', note: 'he takes a bow for his grief performance' },
  { id: 'end-march',      from: 149.48, to: 155.00, set: 'street',    note: 'marches on, delighted' },
  { id: 'end-card',       from: 155.00, to: 160.99, set: 'street',    note: 'THE END' },
];

for (let i = 0; i < SHOTS.length - 1; i++) {
  SHOTS[i].to = SHOTS[i + 1].from;
}

export const SHOT_END = SHOTS[SHOTS.length - 1].to;

/** which shot is playing at song-second t */
export function shotAt(t) {
  const time = Number.isFinite(t) ? Math.max(0, Math.min(t, SHOT_END)) : 0;
  let i = SHOTS.length - 1;
  while (i > 0 && time < SHOTS[i].from) i--;
  const shot = SHOTS[i];
  return { i, shot, t: Math.min(time - shot.from, shot.to - shot.from) };
}
