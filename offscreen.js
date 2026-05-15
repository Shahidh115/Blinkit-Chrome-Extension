// offscreen.js
// Listens for messages to play audio and closes itself after playing

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "PLAY_SOUND") {
    const duration = Number(msg.duration) || 3000;
    playAlarm(duration);
  }
});

// Play the alarm sound and close the offscreen document after duration
function playAlarm(durationMs) {
  try {
    // Popular short alarm sound hosted by Google (CORS allowed)
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    audio.play().catch(()=>{ /* autoplay may fail if Chrome blocks; still close after timeout */ });

    // Ensure the offscreen document is closed after the sound or timeout
    setTimeout(() => {
      if (chrome.offscreen && chrome.offscreen.closeDocument) {
        chrome.offscreen.closeDocument();
      }
    }, durationMs + 200);
  } catch (e) {
    // If anything fails, still attempt to close
    if (chrome.offscreen && chrome.offscreen.closeDocument) {
      chrome.offscreen.closeDocument();
    }
  }
}
