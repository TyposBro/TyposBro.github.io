function enableAutoplay() {
  document.getElementById("myAudio").play();
}

enableAutoplay();

window.onload = enableAutoplay;
var promise = document.querySelector("video").play();

if (promise !== undefined) {
  promise
    .then((_) => {
      // Autoplay started!
    })
    .catch((error) => {
      // Autoplay was prevented.
      // Show a "Play" button so that user can start playback.
      
    });
}
