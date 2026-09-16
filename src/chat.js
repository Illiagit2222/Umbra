

const { invoke } = window.__TAURI__.core;
const { getCurrentWindow } = window.__TAURI__.window;
const { listen } = window.__TAURI__.event;

const appContainer = document.getElementById("app-container");
const dragBar = document.getElementById("drag-bar");
const chatList = document.getElementById("chat-list");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatClear = document.getElementById("chat-clear");
const chatStatus = document.getElementById("chat-status");
const customScrollbar = document.getElementById("custom-scrollbar");
const customThumb = document.getElementById("custom-thumb");

function hexWithAlpha(hex, alpha) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16).padStart(2, "0");
  return hex + a;
}

async function loadTheme() {
  try {
    const theme = await invoke("get_theme");
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--card-bg", hexWithAlpha(theme.cardBg, theme.cardAlpha));
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--card-radius", theme.radius + "px");
    root.style.setProperty("--card-h", theme.cardH + "px");
    root.style.setProperty("--glow-size", theme.glow ? theme.glowStrength + "px" : "0px");
  } catch (e) {
    console.warn("chat theme load failed:", e);
  }
}

function uiZoom() {
  const inline = parseFloat(document.documentElement.style.zoom);
  if (inline && !isNaN(inline) && inline > 0) return inline;
  const bodyInline = parseFloat(document.body.style.zoom);
  if (bodyInline && !isNaN(bodyInline) && bodyInline > 0) return bodyInline;
  try {
    const cs = parseFloat(getComputedStyle(document.documentElement).zoom);
    if (cs && !isNaN(cs) && cs > 0) return cs;
  } catch {}
  const r = document.body.getBoundingClientRect();
  return r.width > 0 ? r.width / window.innerWidth : 1;
}

const tipEl = document.createElement("div");
tipEl.id = "tooltip";
document.body.appendChild(tipEl);

function hideTip() {
  tipEl.classList.remove("visible");
  tipEl._target = null;
}

let tipTimer = null;

function scheduleTip(target) {
  cancelTip();
  if (!(target instanceof Element) || !target.dataset.tip) return;
  tipTimer = setTimeout(() => {
    tipTimer = null;
    showTip(target);
  }, 350);
}

function cancelTip() {
  if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
}

function showTip(target) {
  const text = target.dataset.tip;
  if (!text) { hideTip(); return; }
  if (tipEl.textContent !== text) tipEl.textContent = text;
  const z = uiZoom();
  const tb = tipEl.getBoundingClientRect();
  const tw = tb.width;
  const th = tb.height;
  const vw = window.innerWidth * z;
  const vh = window.innerHeight * z;
  const r = target.getBoundingClientRect();
  const x = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - 8));
  let y = r.bottom + 8;
  if (y + th + 8 > vh) y = r.top - th - 8;
  if (y < 8) y = 8;
  tipEl.style.left = x / z + "px";
  tipEl.style.top = y / z + "px";
  tipEl.classList.add("visible");
  tipEl._target = target;
}

document.addEventListener("mouseover", (e) => {
  const t = e.target instanceof Element ? e.target.closest("[data-tip]") : null;
  if (t !== tipEl._target) {
    hideTip();
    if (t) scheduleTip(t);
  }
});

document.addEventListener("mouseout", (e) => {
  const t = e.target instanceof Element ? e.target.closest("[data-tip]") : null;
  const to = e.relatedTarget instanceof Element ? e.relatedTarget.closest("[data-tip]") : null;
  if (t && t !== to) {
    cancelTip();
    hideTip();
  }
});

document.addEventListener("pointerdown", () => {
  cancelTip();
  hideTip();
}, true);

document.addEventListener("wheel", () => {
  cancelTip();
  hideTip();
}, { passive: true });

const DRAG_THRESHOLD_PX = 5;
let dragPressOrigin = null;
let nativeDragActive = false;

dragBar.addEventListener("mousedown", (e) => {
  if (e.button !== 0 || nativeDragActive) return;
  dragPressOrigin = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mousemove", (e) => {
  if (!dragPressOrigin || nativeDragActive) return;
  
  if (e.buttons === 0) { dragPressOrigin = null; return; }
  const dx = e.clientX - dragPressOrigin.x;
  const dy = e.clientY - dragPressOrigin.y;
  if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
  dragPressOrigin = null;
  nativeDragActive = true;
  appContainer.classList.add("dragging");
  getCurrentWindow().startDragging().then(() => {
    appContainer.classList.remove("dragging");
  }).catch(() => {
    appContainer.classList.remove("dragging");
  }).finally(() => {
    setTimeout(() => { nativeDragActive = false; }, 120);
  });
});

function timeNow() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function scrollBottom() {
  chatList.scrollTop = chatList.scrollHeight;
  updateThumb();
}

function addMessage(text, who) {
  const el = document.createElement("div");
  el.className = "msg " + who;
  el.innerHTML = escapeHtml(text) + `<span class="msg-time">${timeNow()}</span>`;
  chatList.appendChild(el);
  scrollBottom();
  return el;
}

function setStatus(t) {
  chatStatus.textContent = t;
}

let stubTimer = null;

function sendStub(text) {
  const q = text.trim();
  if (!q) return;
  addMessage(q, "out");
  chatInput.value = "";
  setStatus("typing…");
  const typing = document.createElement("div");
  typing.className = "msg typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  chatList.appendChild(typing);
  scrollBottom();
  clearTimeout(stubTimer);
  stubTimer = setTimeout(() => {
    typing.remove();
    
    addMessage("Заглушка: бэкенд чата ещё не подключён. Ты написал: «" + q + "»", "in");
    setStatus("stub — backend later");
  }, 900);
}

chatSend.addEventListener("click", () => {
  sendStub(chatInput.value);
  chatInput.focus();
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendStub(chatInput.value);
  } else if (e.key === "Escape") {
    invoke("hide_chat_window").catch(() => {});
  }
});

chatClear.addEventListener("click", () => {
  chatList.innerHTML = "";
  seedStub();
  chatClear.blur();
});

let thumbTimer = null;
function updateThumb() {
  if (!customScrollbar || !customThumb) return;
  const maxScroll = chatList.scrollHeight - chatList.clientHeight;
  if (maxScroll <= 4) {
    customScrollbar.classList.add("hidden");
    return;
  }
  customScrollbar.classList.remove("hidden");
  const trackH = customScrollbar.clientHeight;
  if (trackH <= 0) return;
  const thumbH = Math.max(24, Math.min(42, (chatList.clientHeight / chatList.scrollHeight) * trackH));
  const ratio = maxScroll > 0 ? chatList.scrollTop / maxScroll : 0;
  customThumb.style.height = thumbH + "px";
  customThumb.style.transform = `translateY(${ratio * Math.max(0, trackH - thumbH)}px)`;
  customScrollbar.classList.add("visible");
  clearTimeout(thumbTimer);
  thumbTimer = setTimeout(() => customScrollbar.classList.remove("visible"), 700);
}

chatList.addEventListener("scroll", updateThumb, { passive: true });
window.addEventListener("resize", updateThumb);
try {
  new MutationObserver(updateThumb).observe(chatList, { childList: true });
} catch {}

let hideTimer = null;
let isHiding = false;

function hideChat() {
  if (isHiding) return;
  isHiding = true;
  appContainer.classList.remove("window-showing");
  appContainer.classList.add("window-hidden");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    invoke("hide_chat_window").catch(() => {});
    isHiding = false;
  }, 280);
}

function seedStub() {
  addMessage("Привет! Я чат-заглушка — настоящий бэкенд подключим позже.", "in");
}

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  seedStub();
});

listen("chat-shown", () => {
  clearTimeout(hideTimer);
  isHiding = false;
  loadTheme();
  appContainer.classList.remove("window-hidden");
  appContainer.classList.add("window-showing");
  updateThumb();
  setTimeout(() => chatInput.focus(), 30);
});

listen("window-hide-requested", () => {
  hideChat();
});
