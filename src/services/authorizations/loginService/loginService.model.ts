import { createEffect, createEvent, createStore, sample } from "effector";
import { ApiError } from "../../../api/http";
import type {
  AuthProvider,
  AuthSessionState,
  AuthStartRequest,
  AuthStartResponse,
  AuthVerifyRequest,
  AuthVerifyResponse
} from "../../../api/types";
import { startAuth, verifyAuth } from "./loginService.api";

interface StartAuthPayload extends AuthStartRequest {
  apiBaseUrl: string;
}

interface VerifyAuthPayload extends AuthVerifyRequest {
  apiBaseUrl: string;
  provider: AuthProvider;
}

const storageKey = "dostup.tg.session.v2";

const startLogin = createEvent<StartAuthPayload>();
const verifyLogin = createEvent<VerifyAuthPayload>();
const restoreSession = createEvent<void>();
const clearSession = createEvent<void>();
const clearChallenge = createEvent<void>();
const setSession = createEvent<AuthSessionState>();
const setClientStatus = createEvent<{ message: string; isError: boolean }>();

const startLoginFx = createEffect<StartAuthPayload, AuthStartResponse>(
  async ({ apiBaseUrl, ...payload }) => startAuth(apiBaseUrl, payload)
);
const verifyLoginFx = createEffect<VerifyAuthPayload, AuthSessionState>(
  async ({ apiBaseUrl, provider, ...payload }) => {
    const verified = await verifyAuth(apiBaseUrl, payload);
    return {
      ...verified,
      challenge_id: payload.challenge_id,
      provider,
      api_base_url: apiBaseUrl,
      created_at: new Date().toISOString()
    };
  }
);

const $status = createStore("Готово к входу");
const $statusError = createStore(false);
const $challengeId = createStore("");
const $debugCode = createStore("");
const $session = createStore<AuthSessionState | null>(null);

sample({ clock: startLogin, target: startLoginFx });
sample({ clock: verifyLogin, target: verifyLoginFx });

sample({
  clock: startLoginFx.done,
  filter: ({ params }) => params.provider === "telegram",
  fn: ({ params, result }) => ({
    apiBaseUrl: params.apiBaseUrl,
    provider: "telegram" as const,
    challenge_id: result.challenge_id,
    code: "telegram"
  }),
  target: verifyLoginFx
});

sample({
  clock: verifyLoginFx.doneData,
  fn: () => undefined,
  target: clearChallenge
});

$challengeId
  .on(startLoginFx.doneData, (_, payload) => payload.challenge_id)
  .reset(clearChallenge)
  .reset(clearSession);

$debugCode
  .on(startLoginFx.doneData, (_, payload) => payload.debug_code ?? "")
  .reset(clearChallenge)
  .reset(clearSession);

$session.on(verifyLoginFx.doneData, (_, payload) => payload).on(setSession, (_, payload) => payload).on(clearSession, () => null);

$status
  .on(startLoginFx.done, (_, { params }) =>
    params.provider === "telegram" ? "Подтверждаем Telegram-вход..." : "Код отправлен. Введите его ниже."
  )
  .on(verifyLoginFx.doneData, (_, payload) =>
    payload.is_new_user ? "Регистрация завершена, сессия создана." : "Вход выполнен."
  )
  .on(setClientStatus, (_, payload) => payload.message)
  .on(clearSession, () => "Сессия очищена.")
  .on(setSession, () => "Локальная dev-сессия создана.");

$statusError
  .on(startLoginFx.done, () => false)
  .on(verifyLoginFx.done, () => false)
  .on(startLoginFx.fail, () => true)
  .on(verifyLoginFx.fail, () => true)
  .on(setClientStatus, (_, payload) => payload.isError)
  .on(clearSession, () => false)
  .on(setSession, () => false);

$status.on(startLoginFx.failData, (_, error) => {
  if (error instanceof ApiError && error.status === 0) {
    return "Не удалось подключиться к серверу. Повторите попытку.";
  }

  return error.message || "Ошибка запуска авторизации";
});

$status.on(verifyLoginFx.failData, (_, error) => {
  if (error instanceof ApiError && error.status === 0) {
    return "Не удалось подключиться к серверу. Повторите попытку.";
  }

  return error.message || "Ошибка подтверждения авторизации";
});

sample({
  clock: [verifyLoginFx.doneData, setSession],
  fn: (payload) => {
    localStorage.setItem(storageKey, JSON.stringify(payload));
    return payload;
  },
  target: $session
});

sample({
  clock: restoreSession,
  fn: () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as AuthSessionState) : null;
    } catch {
      return null;
    }
  },
  target: $session
});

sample({
  clock: clearSession,
  fn: () => {
    localStorage.removeItem(storageKey);
    return null;
  },
  target: $session
});

export const loginService = {
  inputs: {
    startLogin,
    verifyLogin,
    restoreSession,
    clearSession,
    clearChallenge,
    setSession,
    setClientStatus
  },
  outputs: {
    $challengeId,
    $debugCode,
    $status,
    $statusError,
    $session,
    $isStarting: startLoginFx.pending,
    $isVerifying: verifyLoginFx.pending
  }
};
