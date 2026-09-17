# Resume sources

`public/resume-{android,backend,frontend}.pdf` are generated from the HTML files
here. Edit the HTML, then run `./resume-src/build.sh` to regenerate all three.

Facts to keep in sync when editing. These were wrong in the previous version:

- Visa is F-2-7, which needs no sponsor. The old PDFs said E-7, which understated it.
- Public contact address is khasanjonovich@gmail.com, not the old proton address.
- No monthly-active-user figure. Use 100,000+ installs, 4.8 stars and cash-positive,
  all verifiable on Google Play and none of which decay.
- StoneLab dates must match LinkedIn: Jul 2024 to present, with the Jan to Mar 2023
  internship listed separately.
- The Brivva pipeline uses Soniox for speech to text and ElevenLabs for voice, not
  Whisper or Deepgram.
