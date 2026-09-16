

const colorHistory = [];

function toHexColor(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function tintColor(r, g, b, amount) {
  const target = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  const mix = (c) => Math.round(c + (target - c) * a);
  return toHexColor(mix(r), mix(g), mix(b));
}

function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rememberColor(hex) {
  const i = colorHistory.indexOf(hex);
  if (i !== -1) colorHistory.splice(i, 1);
  colorHistory.unshift(hex);
  if (colorHistory.length > 8) colorHistory.length = 8;
}

function showOpenCard(url, label) {
  specialSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");
  pinsSection.classList.add("hidden");
  specialContent.innerHTML = `
    <div class="special-card">
      <div class="special-action" data-url="${escapeHtml(url)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        <span>${escapeHtml(label)}</span>
      </div>
    </div>
  `;
  specialContent.querySelector(".special-action").addEventListener("click", (e) => {
    const url = e.currentTarget.dataset.url;
    invoke("launch_item", { path: url });
    hideWindow();
  });
}

function handleSpecialCommand(query) {
  const q = query.trim();

  const killMatch = q.match(/^kill\s+(.+)/i);
  if (killMatch) {
    const procName = killMatch[1].trim();
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `
      <div class="special-card">
        <div class="special-action" data-kill="${escapeHtml(procName)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>kill process: ${escapeHtml(procName)}</span>
        </div>
      </div>
    `;
    specialContent.querySelector(".special-action").addEventListener("click", async () => {
      try {
        const result = await invoke("kill_process", { name: procName });
        const el = specialContent.querySelector(".special-action span");
        el.textContent = result;
        setTimeout(hideWindow, 1000);
      } catch (e) {
        const el = specialContent.querySelector(".special-action span");
        el.textContent = `error: ${e}`;
      }
    });
    return true;
  }

  const powerMatch = q.match(/^(shutdown|restart|sleep)$/i);
  if (powerMatch) {
    const cmd = powerMatch[1].toLowerCase();
    const labels = { shutdown: "shutting down", restart: "restarting", sleep: "sleeping" };
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `
      <div class="special-card">
        <div class="special-action" data-power="${cmd}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
          </svg>
          <span>confirm ${cmd}?</span>
        </div>
      </div>
    `;
    specialContent.querySelector(".special-action").addEventListener("click", async () => {
      try {
        const result = await invoke("exec_power_command", { command: cmd });
        const el = specialContent.querySelector(".special-action span");
        el.textContent = labels[cmd] || result;
      } catch (e) {
        const el = specialContent.querySelector(".special-action span");
        el.textContent = `error: ${e}`;
      }
    });
    return true;
  }

  const colorMatch = q.match(/^#([0-9a-f]{3,8})$/i);
  if (colorMatch) {
    let hex = colorMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split("").map(c => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const hexFull = toHexColor(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);
    rememberColor(hexFull);
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `
      <div class="special-card color-panel">
        <div class="color-swatch" style="background:${hexFull}">
          <div class="color-shades">
            <span style="background:${tintColor(r, g, b, 0.22)}"></span>
            <span style="background:${tintColor(r, g, b, 0.08)}"></span>
            <span style="background:${tintColor(r, g, b, -0.18)}"></span>
          </div>
          <span class="color-hex">${hexFull.toUpperCase()}</span>
        </div>
        <div class="color-meta">
          <div class="color-label">RGB</div>
          <div class="color-value">${r}, ${g}, ${b}</div>
          <div class="color-label">HSL</div>
          <div class="color-value">${h}, ${s}%, ${l}%</div>
          <div class="color-label history">History</div>
          <div class="color-history">
            ${colorHistory.map(c => `<i style="background:${c}" title="${c.toUpperCase()}"></i>`).join("")}
          </div>
        </div>
      </div>
    `;
    specialContent.querySelector(".color-panel").addEventListener("click", () => {
      navigator.clipboard.writeText(hexFull.toUpperCase());
      const el = specialContent.querySelector(".color-hex");
      el.textContent = "copied!";
      setTimeout(() => { el.textContent = hexFull.toUpperCase(); }, 1000);
    });
    return true;
  }

  const mathMatch = q.match(/^[\d\s\+\-\*\/\.\(\)\%\^]+$/);
  if (mathMatch && q.length > 1 && /[\+\-\*\/\%\^]/.test(q)) {
    try {
      const expr = q.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result === "number" && isFinite(result)) {
        specialSection.classList.remove("hidden");
        resultsSection.classList.add("hidden");
        pinsSection.classList.add("hidden");
        specialContent.innerHTML = `
          <div class="special-card">
            <div class="calc-result">
              <div class="calc-expression">${escapeHtml(q)}</div>
              <div class="calc-answer">= ${result}</div>
            </div>
          </div>
        `;
        return true;
      }
    } catch (e) {}
  }

  const zoomMatch = q.match(/^!zoom\s+([\d.]+)$/i);
  if (zoomMatch) {
    const zoom = Math.max(0.5, Math.min(2, parseFloat(zoomMatch[1])));
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `
      <div class="special-card">
        <div class="special-action" data-zoom="${zoom}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <span>confirm zoom ${zoom}?</span>
        </div>
      </div>
    `;
    specialContent.querySelector(".special-action").addEventListener("click", async () => {
      document.documentElement.style.zoom = zoom;
      document.body.style.zoom = zoom;
      try { await invoke("set_zoom", { zoom }); } catch (err) { console.warn("zoom save failed:", err); }
      showToast('Zoom applied');
      hideWindow();
    });
    return true;
  }

  if (/^!help\s*$/i.test(q)) {
    const cmds = [
      { name: "!help", desc: "Show this help", fill: "" },
      { name: "!zoom <0.5-2>", desc: "Change UI zoom", fill: "!zoom " },
      { name: "!yt <query>", desc: "Search YouTube", fill: "!yt " },
      { name: "!g <query>", desc: "Search Google", fill: "!g " },
      { name: "!gh <query>", desc: "Search GitHub", fill: "!gh " },
      { name: "!wiki <query>", desc: "Search Wikipedia", fill: "!wiki " },
      { name: "!d <query>", desc: "Search DuckDuckGo", fill: "!d " },
      { name: "!npm <query>", desc: "Search npm", fill: "!npm " },
      { name: "!red <query>", desc: "Search Reddit", fill: "!red " },
      { name: "!so <query>", desc: "Search StackOverflow", fill: "!so " },
      { name: "!translate <text>", desc: "Google Translate", fill: "!translate " },
      { name: "!dict <word>", desc: "Dictionary", fill: "!dict " },
      { name: "!weather <city>", desc: "Weather (wttr.in)", fill: "!weather " },
      { name: "!fx", desc: "Open XE (USD -> RUB rate)", fill: "!fx" },
      { name: "<expr>", desc: "Calculator (e.g. 2+2*3)", fill: "" },
      { name: "#RRGGBB", desc: "Color picker", fill: "#" },
      { name: "kill <proc>", desc: "Kill process", fill: "kill " },
      { name: "shutdown|restart|sleep", desc: "Power actions", fill: "" },
      { name: "100 usd to eur", desc: "Live currency convert", fill: "" },
    ];
    resultsSection.classList.remove("hidden");
    specialSection.classList.add("hidden");
    pinsSection.classList.add("hidden");

    resultsList.innerHTML = "";
    for (const c of cmds) {
      const el = document.createElement("div");
      el.className = "result-item";
      el.style.paddingLeft = "16px";
      el.innerHTML = `
        <div class="result-name" style="font-family:var(--font-main);font-weight:var(--weight-regular);font-size:13px">${escapeHtml(c.name)}</div>
        <div class="result-path" style="font-size:13px">${escapeHtml(c.desc)}</div>
      `;

      el.addEventListener("click", () => {
        if (!c.fill) return;
        searchInput.value = c.fill;
        clearBtn.classList.add("visible");
        clearGhost();
        updateCaret();
        searchInput.focus();
      });
      resultsList.appendChild(el);
    }
    selectableItems = cmds.map(c => ({
      name: c.name, path: "", kind: "help", fill: c.fill,
      icon_data: null, pinned: false,
    }));
    selectedIndex = 0;
    updateSelection();
    return true;
  }

  if (/^!fx\s*$/i.test(q)) {
    showOpenCard(
      "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=RUB",
      "open: XE — USD → RUB rate"
    );
    return true;
  }

  const quickMatch = q.match(/^!(\w+)\s+(.+)/);
  if (quickMatch) {
    const site = quickMatch[1].toLowerCase();
    const query = quickMatch[2];
    const sites = {
      yt: "https://www.youtube.com/results?search_query=",
      y: "https://www.youtube.com/results?search_query=",
      gh: "https://github.com/search?q=",
      g: "https://www.google.com/search?q=",
      google: "https://www.google.com/search?q=",
      ru: "https://www.google.ru/search?q=",
      wiki: "https://ru.wikipedia.org/w/index.php?search=",
      w: "https://en.wikipedia.org/w/index.php?search=",
      dict: "https://www.google.com/search?q=define+",
      translate: "https://translate.google.com/?sl=auto&tl=en&text=",
      so: "https://stackoverflow.com/search?q=",
      npm: "https://www.npmjs.com/search?q=",
      py: "https://pypi.org/search/?q=",
      red: "https://www.reddit.com/search/?q=",
      tw: "https://twitter.com/search?q=",
      d: "https://duckduckgo.com/?q=",
    };
    const url = sites[site] || `https://www.google.com/search?q=${site}+`;
    showOpenCard(`${url}${encodeURIComponent(query)}`, `open in ${site}: ${query}`);
    return true;
  }

  const FX_CODES = "usd|eur|cny|jpy|gbp|pln|aud|cad|chf|czk|dkk|hkd|huf|ils|inr|isk|krw|mxn|nok|nzd|php|ron|sek|sgd|thb|try|zar|brl|bgn|myr|idr";
  const currMatch = q.match(new RegExp(`^([\\d.,]+)\\s*(${FX_CODES})\\s+(to|in)\\s+(${FX_CODES})$`, "i"));
  if (currMatch) {
    const amount = parseFloat(currMatch[1].replace(",", "."));
    const from = currMatch[2].toUpperCase();
    const to = currMatch[4].toUpperCase();
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `<div class="special-card"><div class="weather-loading">Loading rates...</div></div>`;
    fetchWithTimeout(`https://api.frankfurter.app/latest?from=USD&to=${[...new Set(["USD", from, to])].join(",")}`)
      .then(r => r.json())
      .then(data => {
        const r = data.rates;
        const fromRate = from === "USD" ? 1 : r[from];
        const toRate = to === "USD" ? 1 : r[to];
        if (!fromRate || !toRate) {
          specialContent.innerHTML = `<div class="special-card"><div class="weather-loading">Unsupported currency: ${!fromRate ? from : to}</div></div>`;
          return;
        }
        const result = (amount / fromRate) * toRate;
        specialContent.innerHTML = `
          <div class="special-card">
            <div class="calc-result">
              <div class="calc-expression">${amount} ${from}</div>
              <div class="calc-answer">= ${result.toFixed(2)} ${to}</div>
              <div style="font-size:12px;color:var(--text-dim);margin-top:8px">1 USD = ${r[from] || "-"} ${from} | ${data.date}</div>
            </div>
          </div>
        `;
      })
      .catch(() => {
        specialContent.innerHTML = `<div class="special-card"><div class="weather-loading">Failed to fetch rates</div></div>`;
      });
    return true;
  }

  const weatherMatch = q.match(/^(weather|погода)\s+(.+)/i);
  if (weatherMatch) {
    const city = weatherMatch[2];
    specialSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    pinsSection.classList.add("hidden");
    specialContent.innerHTML = `<div class="special-card"><div class="weather-loading">loading weather for ${escapeHtml(city)}...</div></div>`;
    fetchWithTimeout(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
      .then(r => r.json())
      .then(data => {
        const cur = data.current_condition[0];
        const desc = cur.weatherDesc[0].value;
        const temp = cur.temp_C;
        const feels = cur.FeelsLikeC;
        const humidity = cur.humidity;
        const wind = cur.windspeedKmph;
        const windDir = cur.winddir16Point;
        specialContent.innerHTML = `
          <div class="special-card">
            <div class="weather-result">
              <div class="weather-city">${escapeHtml(data.nearest_area[0].areaName[0].value)}</div>
              <div class="weather-info">${temp}°C</div>
              <div class="weather-desc">${escapeHtml(desc)}</div>
              <div class="weather-details">
                <span>feels ${feels}°C</span>
                <span>humidity ${humidity}%</span>
                <span>wind ${wind} km/h ${windDir}</span>
              </div>
            </div>
          </div>
        `;
      })
      .catch(() => {
        specialContent.innerHTML = `<div class="special-card"><div class="weather-loading">failed to load weather</div></div>`;
      });
    return true;
  }

  return false;
}
