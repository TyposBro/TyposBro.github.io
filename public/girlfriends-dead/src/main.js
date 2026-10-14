import { W, H, setCamera } from './engine.js';
import { drawFrame, sceneAt, TIMELINE, DURATION, BPM, BEAT } from './scenes.js';
import { createPlayer } from './player.js';

/* The song is "My Girlfriend's Dead" by The Vandals, played from YouTube. */
const VIDEO_ID = 'O8Sl_-reaBo';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const dpr = Math.min(2, window.devicePixelRatio || 1);
canvas.width = W * dpr;
canvas.height = H * dpr;

const ui = {
  time: document.getElementById('t'),
  scene: document.getElementById('scene'),
  play: document.getElementById('play'),
  restart: document.getElementById('restart'),
  status: document.getElementById('status'),
  bar: document.getElementById('bar'),
  fill: document.getElementById('fill'),
};

let player = null;
let usingFallback = false;
let fallbackT = 0;
let fallbackPlaying = false;
let last = performance.now();

function fmt(s) {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCamera(ctx, { s: 1, x: 0, y: 0 }, dpr);
  drawFrame(ctx, t);

  const found = sceneAt(t);
  ui.time.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
  ui.scene.textContent = found.scene.name;
  const p = Math.max(0, Math.min(1, t / DURATION));
  ui.fill.style.width = `${(p * 100).toFixed(2)}%`;
}

function loop(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;

  let t = 0;
  if (player && typeof player.getCurrentTime === 'function') {
    t = player.getCurrentTime() || 0;
  } else if (usingFallback) {
    if (fallbackPlaying) fallbackT += dt;
    t = fallbackT;
  }
  render(t);
  requestAnimationFrame(loop);
}

function setPlayingLabel(isPlaying) {
  ui.play.textContent = isPlaying ? '\u23F8  Pause' : '\u25B6  Play';
}

function wireControls() {
  ui.play.addEventListener('click', () => {
    if (player && typeof player.getPlayerState === 'function') {
      const s = player.getPlayerState();
      if (s === 1) { player.pauseVideo(); setPlayingLabel(false); }
      else { player.playVideo(); setPlayingLabel(true); }
    } else if (usingFallback) {
      fallbackPlaying = !fallbackPlaying;
      setPlayingLabel(fallbackPlaying);
    }
  });
  ui.restart.addEventListener('click', () => {
    if (player && player.seekTo) { player.seekTo(0, true); player.playVideo(); setPlayingLabel(true); }
    else if (usingFallback) { fallbackT = 0; fallbackPlaying = true; setPlayingLabel(true); }
  });
  ui.bar.addEventListener('click', (e) => {
    const r = ui.bar.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const t = p * DURATION;
    if (player && player.seekTo) player.seekTo(t, true);
    else if (usingFallback) fallbackT = t;
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); ui.play.click(); }
    if (e.code === 'Home') { ui.restart.click(); }
  });
}

async function boot() {
  wireControls();
  requestAnimationFrame(loop);

  const onStateChange = (e) => {
    // 1 = playing, 2 = paused, 0 = ended
    setPlayingLabel(e.data === 1);
  };

  try {
    player = await createPlayer({
      elementId: 'yt',
      videoId: VIDEO_ID,
      onReady: (p) => {
        ui.status.textContent = `synced to YouTube \u00b7 ${BPM.toFixed(0)} BPM`;
        ui.status.classList.add('ok');
        setPlayingLabel(false);
      },
      onStateChange,
      onError: () => fail('This video can\u2019t be embedded here.'),
    });
  } catch (err) {
    fail('YouTube player unavailable (offline?). Running the animation on a local clock.');
  }
}

function fail(msg) {
  usingFallback = true;
  ui.status.textContent = msg;
  ui.status.classList.add('warn');
}

boot();
