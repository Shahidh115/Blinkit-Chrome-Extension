const BREAK_SECONDS = 20;

const countdownEl = document.getElementById("countdown");
const progressEl = document.getElementById("progress");
const tickSound = document.getElementById("tickSound");
const chimeSound = document.getElementById("chimeSound");

tickSound.volume = 0.18;
chimeSound.volume = 0.5;

let remainingSeconds = BREAK_SECONDS;

chrome.storage.local.get(["phase", "nextTime"], (state) => {
  if (state.phase === "break" && state.nextTime) {
    const secondsLeft = Math.max(1, Math.ceil((state.nextTime - Date.now()) / 1000));
    remainingSeconds = Math.min(BREAK_SECONDS, secondsLeft);
  }

  renderCountdown();
  playTick();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes.phase && changes.phase.newValue === "idle") {
    clearInterval(interval);
    window.close();
  }
});

const interval = setInterval(() => {
  remainingSeconds -= 1;

  if (remainingSeconds > 0) {
    renderCountdown();
    playTick();
    return;
  }

  clearInterval(interval);
  renderCountdown();
  playChimeAndClose();
}, 1000);

function renderCountdown() {
  countdownEl.textContent = remainingSeconds;
  const progress = Math.max(0, remainingSeconds / BREAK_SECONDS);
  progressEl.style.transform = `scaleX(${progress})`;
}

function playTick() {
  tickSound.currentTime = 0;
  tickSound.play().catch(() => {});
}

function playChimeAndClose() {
  chimeSound.currentTime = 0;
  chimeSound.play().catch(() => {});

  chrome.storage.local.get(["phase"], (state) => {
    setTimeout(() => {
      window.close();

      if (state.phase === "break") {
        chrome.runtime.sendMessage({ action: "START" });
      }
    }, 1200);
  });
}
