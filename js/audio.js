function enableAutoplay() {
  if (window.confirm("Do you want to get a full experience?")) {
    document.getElementById("myAudio").play();
    return;
  }
  alert("We cannot play background audio");
}

// enableAutoplay();

window.onload = enableAutoplay;
