/*
 * player.js — thin wrapper around the YouTube IFrame Player API.
 *
 * This is the legal heart of the project: the SONG comes from YouTube's own
 * embedded player (their bandwidth, their ads, the band gets paid). We only
 * read the clock and drive our own canvas animation from it.
 */
const API_SRC = 'https://www.youtube.com/iframe_api';

let apiPromise = null;

function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = API_SRC;
    tag.async = true;
    tag.onerror = () => reject(new Error('failed to load the YouTube IFrame API'));
    document.head.appendChild(tag);
    // safety net
    setTimeout(() => {
      if (window.YT && window.YT.Player) resolve(window.YT);
    }, 6000);
  });
  return apiPromise;
}

export async function createPlayer({ elementId, videoId, onReady, onStateChange, onError }) {
  const YT = await loadApi();
  return new Promise((resolve) => {
    const player = new YT.Player(elementId, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => { onReady && onReady(player); resolve(player); },
        onStateChange: (e) => onStateChange && onStateChange(e),
        onError: (e) => onError && onError(e),
      },
    });
  });
}
