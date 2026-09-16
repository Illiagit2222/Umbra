


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



  if (/^!help\s*$/i.test(q)) {
    const cmds = [
      { name: "!help", desc: "Show this help", fill: "" },
      { name: "!yt <query>", desc: "Search YouTube", fill: "!yt " },
      { name: "!g <query>", desc: "Search Google", fill: "!g " },
      { name: "!gh <query>", desc: "Search GitHub", fill: "!gh " },
      { name: "!wiki <query>", desc: "Search Wikipedia", fill: "!wiki " },
      { name: "!d <query>", desc: "Search DuckDuckGo", fill: "!d " },
      { name: "!npm <query>", desc: "Search npm", fill: "!npm " },
      { name: "!red <query>", desc: "Search Reddit", fill: "!red " },
      { name: "!so <query>", desc: "Search StackOverflow", fill: "!so " },
      { name: "kill <proc>", desc: "Kill process", fill: "kill " },
      { name: "shutdown|restart|sleep", desc: "Power actions", fill: "" },
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
        updateGhost();
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



  return false;
}
