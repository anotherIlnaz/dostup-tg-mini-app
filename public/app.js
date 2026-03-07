const storageKey = "dostup.tg.session.v1";

const refs = {
  apiBaseUrl: document.getElementById("api-base-url"),
  status: document.getElementById("status-line"),
  sessionView: document.getElementById("session-view"),
  challengeId: document.getElementById("challenge-id-input"),
  code: document.getElementById("code-input"),
  email: document.getElementById("email-input"),
  phone: document.getElementById("phone-input"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  panels: Array.from(document.querySelectorAll(".panel")),
  tgAuthBtn: document.getElementById("tg-auth-btn"),
  emailStartBtn: document.getElementById("email-start-btn"),
  phoneStartBtn: document.getElementById("phone-start-btn"),
  verifyBtn: document.getElementById("verify-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  clearBtn: document.getElementById("clear-btn")
};

let activeProvider = "telegram";
let currentChallengeId = "";
let session = readSession();

initTelegram();
hydrateFromQuery();
renderSession();
wireTabs();
wireActions();

function initTelegram() {
  if (!window.Telegram?.WebApp) {
    setStatus("Telegram WebApp недоступен. Для браузерного теста используй email/телефон.", false);
    return;
  }

  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

function hydrateFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const api = query.get("api");
  if (api) {
    refs.apiBaseUrl.value = api;
  }
}

function wireTabs() {
  for (const tab of refs.tabs) {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab || "telegram";
      activeProvider = target;
      for (const item of refs.tabs) {
        item.classList.toggle("is-active", item === tab);
      }
      for (const panel of refs.panels) {
        panel.classList.toggle("is-active", panel.dataset.panel === target);
      }
    });
  }
}

function wireActions() {
  refs.tgAuthBtn.addEventListener("click", startTelegramAuth);
  refs.emailStartBtn.addEventListener("click", () => startAuth("email"));
  refs.phoneStartBtn.addEventListener("click", () => startAuth("phone"));
  refs.verifyBtn.addEventListener("click", verifyAuth);
  refs.logoutBtn.addEventListener("click", logout);
  refs.clearBtn.addEventListener("click", clearSession);
}

async function startTelegramAuth() {
  if (!window.Telegram?.WebApp?.initData) {
    setStatus("Нет initData от Telegram. Открой Mini App из Telegram.", false);
    return;
  }

  await startAuth("telegram");
}

async function startAuth(provider) {
  try {
    const payload = { provider };

    if (provider === "telegram") {
      payload.telegram_init_data = window.Telegram?.WebApp?.initData || "";
    } else if (provider === "email") {
      payload.email = refs.email.value.trim();
    } else if (provider === "phone") {
      payload.phone_e164 = refs.phone.value.trim();
      payload.channel = "sms";
    }

    const result = await request("/v1/auth/start", {
      method: "POST",
      body: payload
    });

    currentChallengeId = result.challenge_id;
    refs.challengeId.value = result.challenge_id;

    if (provider === "telegram") {
      refs.code.value = "telegram";
      await verifyAuth();
      return;
    }

    if (result.debug_code) {
      refs.code.value = result.debug_code;
    }

    setStatus("Код отправлен. Подтверди вход.", true);
  } catch (error) {
    setStatus(readError(error), false);
  }
}

async function verifyAuth() {
  try {
    const challengeId = refs.challengeId.value.trim() || currentChallengeId;
    const code = refs.code.value.trim();
    if (!challengeId) {
      throw new Error("challenge_id пустой");
    }
    if (!code) {
      throw new Error("код пустой");
    }

    const result = await request("/v1/auth/verify", {
      method: "POST",
      body: {
        challenge_id: challengeId,
        code
      }
    });

    session = {
      ...result,
      provider: activeProvider,
      challenge_id: challengeId,
      api_base_url: refs.apiBaseUrl.value.trim(),
      created_at: new Date().toISOString()
    };
    writeSession(session);
    renderSession();
    setStatus(result.is_new_user ? "Регистрация завершена, сессия создана." : "Вход выполнен.", true);
  } catch (error) {
    setStatus(readError(error), false);
  }
}

async function logout() {
  if (!session?.refresh_token) {
    setStatus("Активной сессии нет.", false);
    return;
  }

  try {
    await request("/v1/auth/logout", {
      method: "POST",
      body: {
        refresh_token: session.refresh_token
      }
    });
    clearSession();
    setStatus("Сессия закрыта.", true);
  } catch (error) {
    setStatus(readError(error), false);
  }
}

function clearSession() {
  session = null;
  writeSession(null);
  refs.challengeId.value = "";
  refs.code.value = "";
  renderSession();
}

function renderSession() {
  if (!session) {
    refs.sessionView.textContent = "Сессия не создана";
    return;
  }

  refs.sessionView.textContent = JSON.stringify(session, null, 2);
}

function setStatus(text, ok) {
  refs.status.textContent = text;
  refs.status.classList.remove("is-ok", "is-error");
  refs.status.classList.add(ok ? "is-ok" : "is-error");
}

async function request(path, { method, body }) {
  const baseUrl = refs.apiBaseUrl.value.trim().replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw payload;
  }
  return payload;
}

function readError(error) {
  if (error?.error?.message) {
    return error.error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Неизвестная ошибка";
}

function readSession() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(value) {
  if (!value) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(value));
}
