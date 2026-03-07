import { createEffect, createEvent, createStore, sample } from "effector";
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

const $status = createStore("Готово к проверке");
const $statusError = createStore(false);
const $challengeId = createStore("");
const $debugCode = createStore("");
const $session = createStore<AuthSessionState | null>(null);

sample({ clock: startLogin, target: startLoginFx });
sample({ clock: verifyLogin, target: verifyLoginFx });

$challengeId.on(startLoginFx.doneData, (_, payload) => payload.challenge_id);
$debugCode.on(startLoginFx.doneData, (_, payload) => payload.debug_code ?? "");
$session.on(verifyLoginFx.doneData, (_, payload) => payload);

$status
  .on(startLoginFx.doneData, () => "Код отправлен. Подтверди вход.")
  .on(verifyLoginFx.doneData, (_, payload) =>
    payload.is_new_user ? "Регистрация завершена, сессия создана." : "Вход выполнен."
  )
  .on(clearSession, () => "Сессия очищена.");

$statusError
  .on(startLoginFx.done, () => false)
  .on(verifyLoginFx.done, () => false)
  .on(startLoginFx.fail, () => true)
  .on(verifyLoginFx.fail, () => true)
  .on(clearSession, () => false);

$status.on(startLoginFx.failData, (_, error) => error.message || "Ошибка запуска авторизации");
$status.on(verifyLoginFx.failData, (_, error) => error.message || "Ошибка подтверждения авторизации");

sample({
  clock: verifyLoginFx.doneData,
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
    clearSession
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
