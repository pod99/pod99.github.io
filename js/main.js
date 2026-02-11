const CONTENT_JSON_PATH = "data/content.json";
const LOCAL_CONTENT_KEY = "portfolio_content_overrides_v1";

let contentData = null;

const DEFAULT_CONTENT = {
  openrouterApiKey: "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",
  icons: {
    github: {
      title: "GitHub",
      text: "Репозитории и проекты.",
      link: "https://github.com/pod99"
    },
    spotify: {
      title: "Spotify",
      text: "Плейлист и музыка.",
      link: "https://open.spotify.com/playlist/1JSMQ8CrA6lR0vvevQUMWE?si=6b1e92e0973646ac"
    },
    download: {
      title: "ZIP",
      text: "Скачать набор материалов.",
      link: "https://drive.google.com/drive/folders/1yZLkEvjqZKiBLg9ACPKJp5m4Iblp-aO-?usp=share_link"
    },
    telegram: {
      title: "Telegram",
      text: "Канал обновлений.",
      link: "https://t.me/So1oRanker"
    },
    weather: {
      title: "Погода",
      text: "Москва — сейчас.",
      link: ""
    },
    ai: {
      title: "AI",
      text: "Задайте вопрос через ИИ.",
      link: ""
    },
    timeline: {
      title: "Timeline",
      text: "Прогресс на 2026.",
      link: ""
    }
  }
};

async function loadContent() {
  try {
    const response = await fetch(CONTENT_JSON_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load content.json");
    const json = await response.json();

    const overridesRaw = localStorage.getItem(LOCAL_CONTENT_KEY);
    if (overridesRaw) {
      try {
        const overrides = JSON.parse(overridesRaw);
        contentData = { ...DEFAULT_CONTENT, ...json, ...overrides };
      } catch {
        contentData = { ...DEFAULT_CONTENT, ...json };
      }
    } else {
      contentData = { ...DEFAULT_CONTENT, ...json };
    }
  } catch (e) {
    console.error("Error loading content.json, falling back to defaults:", e);
    contentData = { ...DEFAULT_CONTENT };
  }

  setupOrbitingIcons();
}

function getIconContent(key) {
  const iconDefaults = DEFAULT_CONTENT.icons[key] || { title: key, text: "", link: "" };
  const iconData = contentData?.icons?.[key] || {};
  return {
    title: iconData.title || iconDefaults.title,
    text: iconData.text || iconDefaults.text,
    link: iconData.link || ""
  };
}

function buildPopupHTML(key, iconClass) {
  const { title, text, link } = getIconContent(key);
  const textBlock = text ? `<p>${text}</p>` : "";
  const linkBlock = link
    ? `
      <div class="popup-actions">
        <a class="popup-link" href="${link}" target="_blank" rel="noopener" aria-label="${title}">
          <i class="${iconClass}" aria-hidden="true"></i>
        </a>
      </div>
    `
    : "";

  return `
    <h3>${title}</h3>
    ${textBlock}
    ${linkBlock}
  `;
}

function buildWeatherPopup() {
  const { title, text } = getIconContent("weather");
  return `
    <h3>${title}</h3>
    <p>${text}</p>
    <div class="popup-status" data-weather-status>Загрузка…</div>
    <button type="button" class="popup-cta" data-weather-refresh>Обновить</button>
  `;
}

function buildAiPopup() {
  const { title, text } = getIconContent("ai");
  return `
    <h3>${title}</h3>
    <p>${text}</p>
    <label class="popup-label" for="popup-ai-question">Вопрос</label>
    <textarea class="popup-textarea" id="popup-ai-question" rows="3" placeholder="Напиши вопрос..."></textarea>
    <button type="button" class="popup-cta" data-ai-send>Отправить</button>
    <div class="popup-status" data-ai-status></div>
    <div class="popup-output" data-ai-output></div>
  `;
}

function buildTimelinePopup() {
  const { title, text } = getIconContent("timeline");
  const progress = getYearProgress();
  const percent = Math.round(progress * 100);
  return `
    <h3>${title}</h3>
    <p>${text}</p>
    <div class="popup-progress">
      <div class="popup-progress-bar" style="width: ${percent}%"></div>
    </div>
    <div class="popup-progress-meta">${percent}%</div>
  `;
}

function getYearProgress() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((now - yearStart) / dayMs) + 1;
  const daysTotal = Math.round((nextYearStart - yearStart) / dayMs);
  return Math.min(1, Math.max(0, daysElapsed / daysTotal));
}

function buildPopupTemplates() {
  return {
    github: buildPopupHTML("github", "fa-brands fa-github"),
    spotify: buildPopupHTML("spotify", "fa-brands fa-spotify"),
    download: buildPopupHTML("download", "fa-solid fa-download"),
    telegram: buildPopupHTML("telegram", "fa-brands fa-telegram"),
    weather: buildWeatherPopup(),
    ai: buildAiPopup(),
    timeline: buildTimelinePopup()
  };
}

function setupOrbitingIcons() {
  const layer = document.getElementById("orbit-layer");
  const popupsLayer = document.getElementById("orbit-popups");
  if (!layer || !popupsLayer) return;

  const icons = Array.from(layer.querySelectorAll(".orbit-icon"));
  if (!icons.length) return;

  const popupTemplates = buildPopupTemplates();
  const popupMap = new Map();

  popupsLayer.innerHTML = "";
  icons.forEach((icon) => {
    const key = icon.dataset.popup;
    const template = popupTemplates[key];
    if (!template) return;

    const popup = document.createElement("div");
    popup.className = "orbit-popup";
    popup.dataset.popup = key;
    popup.innerHTML = template;
    popup.addEventListener("click", (event) => event.stopPropagation());
    popupsLayer.appendChild(popup);
    popupMap.set(icon, popup);
  });

  setupPopupInteractions(popupsLayer);

  const getCssNumberVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const num = parseFloat(value);
    return Number.isNaN(num) ? fallback : num;
  };
  const getPadding = () => getCssNumberVar("--orbit-icon-padding", 8);
  const getSpeedMult = () => getCssNumberVar("--orbit-speed-mult", 1);
  const getBounds = () => {
    const width = window.visualViewport?.width || window.innerWidth || layer.clientWidth;
    const height = window.visualViewport?.height || window.innerHeight || layer.clientHeight;
    return { width, height };
  };

  const bounds = getBounds();
  const state = icons.map((el, index) => {
    const size = el.getBoundingClientRect().width || 56;
    const radius = size / 2;
    const padding = getPadding();
    const availableX = Math.max(0, bounds.width - size - padding * 2);
    const availableY = Math.max(0, bounds.height - size - padding * 2);
    const x = padding + Math.random() * availableX;
    const y = padding + Math.random() * availableY;
    const speed = (0.08 + Math.random() * 0.14) * getSpeedMult();
    const angle = (index / Math.max(1, icons.length)) * Math.PI * 2 + Math.random() * 0.4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    return { el, x, y, vx, vy, size, radius, open: false };
  });

  const closeAllPopups = () => {
    state.forEach((item) => {
      item.open = false;
      const popup = popupMap.get(item.el);
      if (popup) popup.classList.remove("is-visible");
      item.el.dataset.paused = "";
    });
  };

  icons.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.dataset.paused = "true";
    });
    el.addEventListener("mouseleave", () => {
      if (!popupMap.get(el)?.classList.contains("is-visible")) {
        el.dataset.paused = "";
      }
    });
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      const popup = popupMap.get(el);
      if (!popup) return;

      const isVisible = popup.classList.contains("is-visible");
      closeAllPopups();
      if (!isVisible) {
        popup.classList.add("is-visible");
        el.dataset.paused = "true";
        const item = state.find((entry) => entry.el === el);
        if (item) item.open = true;
      }
    });
  });

  document.addEventListener("click", () => {
    closeAllPopups();
  });

  const clampToBounds = (item, bounds, padding) => {
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, bounds.width - item.size - padding);
    const maxY = Math.max(minY, bounds.height - item.size - padding);
    item.x = Math.max(minX, Math.min(maxX, item.x));
    item.y = Math.max(minY, Math.min(maxY, item.y));
  };

  let lastTime = 0;
  const tick = (time) => {
    if (!lastTime) lastTime = time;
    const delta = Math.min(48, time - lastTime);
    lastTime = time;
    const bounds = getBounds();
    const padding = getPadding();
    const speedMult = getSpeedMult();

    state.forEach((item) => {
      if (!item.el.dataset.paused) {
        item.x += item.vx * delta * speedMult;
        item.y += item.vy * delta * speedMult;

        const minX = padding;
        const minY = padding;
        const maxX = Math.max(minX, bounds.width - item.size - padding);
        const maxY = Math.max(minY, bounds.height - item.size - padding);

        if (item.x <= minX || item.x >= maxX) {
          item.vx *= -1;
          item.x = Math.max(minX, Math.min(maxX, item.x));
        }
        if (item.y <= minY || item.y >= maxY) {
          item.vy *= -1;
          item.y = Math.max(minY, Math.min(maxY, item.y));
        }
      }
    });

    for (let i = 0; i < state.length; i += 1) {
      for (let j = i + 1; j < state.length; j += 1) {
        const a = state[i];
        const b = state[j];
        const ax = a.x + a.radius;
        const ay = a.y + a.radius;
        const bx = b.x + b.radius;
        const by = b.y + b.radius;
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;
        if (dist > 0 && dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          const avx = a.vx;
          const avy = a.vy;
          a.vx = b.vx;
          a.vy = b.vy;
          b.vx = avx;
          b.vy = avy;
        }
      }
    }

    state.forEach((item) => {
      clampToBounds(item, bounds, padding);
      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      const popup = popupMap.get(item.el);
      if (popup && item.open) {
        const popupRect = popup.getBoundingClientRect();
        let px = item.x + item.size + 10;
        let py = item.y - 6;
        if (px + popupRect.width > bounds.width - padding) {
          px = item.x - popupRect.width - 10;
        }
        if (py + popupRect.height > bounds.height - padding) {
          py = bounds.height - popupRect.height - 8;
        }
        if (py < padding) py = padding;
        popup.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      }
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  const handleResize = () => {
    const bounds = getBounds();
    const padding = getPadding();
    state.forEach((item) => {
      clampToBounds(item, bounds, padding);
    });
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
  window.visualViewport?.addEventListener("resize", handleResize);
}

function setupPopupInteractions(popupsLayer) {
  setupWeather(popupsLayer);
  setupAI(popupsLayer);
}

function setupWeather(popupsLayer) {
  const statusEl = popupsLayer.querySelector("[data-weather-status]");
  const refreshBtn = popupsLayer.querySelector("[data-weather-refresh]");
  if (!statusEl || !refreshBtn) return;

  const fetchWeather = async () => {
    statusEl.textContent = "Загрузка…";
    try {
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m,weather_code&timezone=Europe/Moscow";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather API error");
      const data = await res.json();
      const temp = Math.round(data.current?.temperature_2m ?? 0);
      const code = data.current?.weather_code ?? 0;
      const desc = weatherCodeToText(code);
      statusEl.textContent = `${temp}°C, ${desc}`;
    } catch (err) {
      console.error("Weather error", err);
      statusEl.textContent = "Не удалось загрузить погоду.";
    }
  };

  refreshBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    fetchWeather();
  });

  fetchWeather();
}

function weatherCodeToText(code) {
  const map = {
    0: "Ясно",
    1: "В основном ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Иней",
    51: "Морось",
    53: "Морось",
    55: "Сильная морось",
    61: "Дождь",
    63: "Дождь",
    65: "Сильный дождь",
    71: "Снег",
    73: "Снег",
    75: "Сильный снег",
    80: "Ливень",
    81: "Ливень",
    82: "Сильный ливень",
    95: "Гроза",
    96: "Гроза",
    99: "Гроза"
  };
  return map[code] || "Погода";
}

function setupAI(popupsLayer) {
  const questionInput = popupsLayer.querySelector("#popup-ai-question");
  const sendBtn = popupsLayer.querySelector("[data-ai-send]");
  const statusEl = popupsLayer.querySelector("[data-ai-status]");
  const outputEl = popupsLayer.querySelector("[data-ai-output]");
  if (!questionInput || !sendBtn || !statusEl || !outputEl) return;

  const apiKey = contentData?.openrouterApiKey || DEFAULT_CONTENT.openrouterApiKey;

  sendBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    const question = questionInput.value.trim();

    if (!apiKey) {
      statusEl.textContent = "API ключ не задан.";
      return;
    }
    if (!question) {
      statusEl.textContent = "Введите вопрос.";
      return;
    }

    statusEl.textContent = "Отправка...";
    outputEl.textContent = "";

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [{ role: "user", content: question }]
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || "(пустой ответ)";
      outputEl.textContent = answer;
      statusEl.textContent = "";
    } catch (err) {
      console.error("OpenRouter error", err);
      statusEl.textContent = "Ошибка запроса. Проверь ключ.";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadContent();
});
