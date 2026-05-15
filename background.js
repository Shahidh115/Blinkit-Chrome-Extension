const WORK_MINUTES = 20;
const REST_SECONDS = 20;
const WORK_ALARM = "WORK_ALARM";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ running: false, phase: "idle", nextTime: null });
  syncBadge({ running: false });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["running"], (state) => syncBadge(state));
});

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.action === "START") startWork();
  if (msg.action === "STOP") stopAll();
  if (msg.action === "STATUS") {
    chrome.storage.local.get(["running", "phase", "nextTime"], sendResponse);
    return true;
  }
});

function startWork() {
  const nextTime = Date.now() + WORK_MINUTES * 60000;

  chrome.alarms.clearAll(() => {
    chrome.alarms.create(WORK_ALARM, { when: nextTime });
    chrome.storage.local.set({ running: true, phase: "work", nextTime });
    syncBadge({ running: true });
  });
}

function startBreak() {
  const nextTime = Date.now() + REST_SECONDS * 1000;

  chrome.storage.local.set({ running: true, phase: "break", nextTime });
  syncBadge({ running: true });

  openBreakWindow();
}

function stopAll() {
  chrome.alarms.clearAll();
  chrome.storage.local.set({ running: false, phase: "idle", nextTime: null });
  syncBadge({ running: false });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === WORK_ALARM) {
    startBreak();
  }
});

function openBreakWindow() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    const existingWindow = windows.find((win) =>
      win.tabs?.some((tab) => tab.url?.includes("break.html"))
    );

    if (existingWindow?.id) {
      chrome.windows.update(existingWindow.id, { focused: true });
      return;
    }

    chrome.windows.create({
      url: "break.html",
      type: "popup",
      width: 380,
      height: 560,
      focused: true
    });
  });
}

function syncBadge(state) {
  const text = state.running ? "ON" : "";
  chrome.action.setBadgeBackgroundColor({ color: "#0f766e" });
  chrome.action.setBadgeText({ text });
}
