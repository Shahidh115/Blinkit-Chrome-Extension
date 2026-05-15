document.addEventListener("DOMContentLoaded", () => {
  const timerEl = document.getElementById("timer");
  const modeEl = document.getElementById("mode");
  const statusChipEl = document.getElementById("statusChip");
  const phaseLabelEl = document.getElementById("phaseLabel");
  const nextLabelEl = document.getElementById("nextLabel");
  const toggleBtn = document.getElementById("toggle");
  let isRunning = false;

  const renderToggleButton = () => {
    toggleBtn.classList.toggle("running", isRunning);
    toggleBtn.setAttribute("aria-label", isRunning ? "Stop reminders" : "Start reminders");
  };

  toggleBtn.onclick = () => {
    chrome.runtime.sendMessage({ action: isRunning ? "STOP" : "START" }, () => {
      refresh();
    });
  };

  const refresh = () => {
    chrome.runtime.sendMessage({ action: "STATUS" }, (res) => {
      isRunning = Boolean(res && res.running && res.nextTime);
      renderToggleButton();

      if (!isRunning) {
        timerEl.textContent = "20:00";
        timerEl.className = "timer work";
        modeEl.textContent = "Ready when you are";
        statusChipEl.textContent = "Ready";
        statusChipEl.className = "status-chip idle";
        phaseLabelEl.textContent = "Idle";
        nextLabelEl.textContent = "20 min";
        return;
      }

      const diff = Math.max(0, res.nextTime - Date.now());
      const totalSeconds = Math.ceil(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      const isBreak = res.phase === "break";
      timerEl.className = isBreak ? "timer break" : "timer work";
      modeEl.textContent = isBreak ? "Look 20 feet away" : "Focus session active";
      statusChipEl.textContent = isBreak ? "Break now" : "Working";
      statusChipEl.className = isBreak ? "status-chip break" : "status-chip active";
      phaseLabelEl.textContent = isBreak ? "Break" : "Work";
      nextLabelEl.textContent = isBreak ? "20 sec" : "20 min";
    });
  };

  refresh();
  setInterval(refresh, 1000);
});
