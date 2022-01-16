function enableAutoplay() {
  if (window.confirm("Do you want to get a full experience?")) {
    document.getElementById("myAudio").play();
  }
}

// enableAutoplay();

window.onload = enableAutoplay;
