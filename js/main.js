document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const input = document.getElementById("command-input");
  const terminal = document.getElementById("terminal");

  const commands = {
    help: `
Available commands:
  <span class="command-output">whoami</span>       - About Me
  <span class="command-output">projects</span>     - View my major projects
  <span class="command-output">skills</span>       - List my technical skills
  <span class="command-output">contact</span>      - Display contact information
  <span class="command-output">resume</span>       - Download my latest resume
  <span class="command-output">clear</span>        - Clear the terminal screen
        `,
    whoami: `
Azizbek Umidjonov // Founder & Engineer

I am an entrepreneurial Software Engineer and Founder with Principal-level expertise in end-to-end product development. I specialize in architecting high-performance native mobile applications, on-device AI solutions, and monetized, globally-ready products. 

I thrive on deep technical challenges and building things from scratch. My passion lies in owning the full product lifecycle, from ideation and architecture to deployment and cost optimization.
        `,
    projects: `
I focus on building complete products. Here are my two primary ventures:

1. <span class="command-output">MilliyTechnology (Founder & CTO)</span>
   - A novel AI-driven English learning platform built from the ground up.
   - Features a high-performance, fully offline AI pipeline using Vosk (real-time speech recognition) and a custom ONNX model (text-to-speech).
   - Engineered a cost-optimized serverless backend on Cloudflare Workers.
   - Architected a full monetization system with Google Play Billing and regional providers.

2. <span class="command-output">ARIA Wellness at StoneLab (Lead Mobile Engineer)</span>
   - Led the end-to-end development of the native Android app (Jetpack Compose).
   - Implemented complex features like AI-based audio streaming, OAuth, and camera integration.
   - Ensured the product was global-ready with full Korean/English localization.
        `,
    skills: `
<span class="command-output">Languages:</span>      Kotlin, Dart, Python, TypeScript/JavaScript, C++
<span class="command-output">Mobile:</span>         Jetpack Compose, Flutter, Android SDK, Google Play Billing
<span class="command-output">AI / ML:</span>        ONNX Runtime, Vosk, PyTorch, Hugging Face, LLM Integration
<span class="command-output">Backend & Cloud:</span>  Cloudflare Workers, Node.js, D1/R2, Firebase
<span class="command-output">DevOps & Tools:</span>   Git, GitHub (Actions, Projects), Docker, Kubernetes
        `,
    contact: `
<span class="command-output">Email:</span>     <a href="mailto:typosbro@proton.me">typosbro@proton.me</a>
<span class="command-output">LinkedIn:</span>  <a href="https://linkedin.com/in/TyposBro" target="_blank">linkedin.com/in/TyposBro</a>
<span class="command-output">GitHub:</span>    <a href="https://github.com/TyposBro" target="_blank">github.com/TyposBro</a>
        `,
    resume: () => {
      // Make sure your resume PDF is in a 'pdf' folder
      window.open("pdf/Azizbek_Umidjonov_RESUME.pdf", "_blank");
      return "Downloading resume...";
    },
  };

  const welcomeMessage = `
Welcome to my interactive portfolio.
Type '<span class="command-output">help</span>' to see a list of available commands.
    `;

  function typeWelcomeMessage() {
    // *** THIS IS THE CORRECTED LINE ***
    new Typewriter("#output", {
      strings: [welcomeMessage],
      autoStart: true,
      delay: 40,
      loop: false,
      cursor: "",
      // This ensures the typewriter writes into the existing #output div
      // instead of replacing it. We'll use a wrapper for the text.
      wrapperClassName: "typewriter-wrapper",
    });
  }

  function executeCommand(command) {
    // Add the command to the output
    const commandLine = document.createElement("div");
    commandLine.innerHTML = `<span class="prompt">guest@typosbro.me:~$</span> <span class="command-output">${command}</span>`;
    output.appendChild(commandLine);

    if (command.toLowerCase() === "clear") {
      output.innerHTML = "";
    } else if (commands[command.toLowerCase()]) {
      const result = commands[command.toLowerCase()];
      const resultElement = document.createElement("div");
      if (typeof result === "function") {
        resultElement.innerHTML = result();
      } else {
        resultElement.innerHTML = result;
      }
      output.appendChild(resultElement);
    } else {
      const errorElement = document.createElement("div");
      errorElement.innerHTML = `Command not found: ${command}. Type 'help' for a list of commands.`;
      output.appendChild(errorElement);
    }

    // Scroll to the bottom
    terminal.scrollTop = terminal.scrollHeight;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = input.value.trim();
      input.value = "";
      if (command) {
        executeCommand(command);
      }
    }
  });

  // Focus on the input when the terminal is clicked
  terminal.addEventListener("click", () => {
    input.focus();
  });

  // Start with the welcome message
  typeWelcomeMessage();
});
