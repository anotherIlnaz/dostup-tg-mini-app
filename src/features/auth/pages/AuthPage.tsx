import { useEffect, useRef, useState } from "react";
import { useUnit } from "effector-react";
import { ApiError } from "../../../api/http";
import type { AuthProvider, AuthSessionState, DeviceResponse, DeviceRoutingMode, PlanSummary, SubscriptionMeResponse } from "../../../api/types";
import { loginService } from "../../../services/authorizations/loginService";
import {
  getPlans,
  getSubscriptionMe,
  getDevices,
  issueSubscriptionLink,
  issueRawSubscriptionLink,
  mockPaySubscription,
  reissueRawSubscriptionLink,
  registerDevice,
  updateDeviceRouting
} from "../../../services/authorizations/loginService/loginService.api";
import { DevLoginPanel } from "../components/DevLoginPanel";
import { DevOnly } from "../components/DevOnly";
import { ProductionLoginCard } from "../components/ProductionLoginCard";
import { SubscriptionManagerPage } from "../components/SubscriptionManagerPage";
import { authFlags, isDevRoute } from "../config/authFlags";
import { getOrCreateDeviceRegistration } from "../utils/deviceIdentity";

const { inputs, outputs } = loginService;

const buildMockSession = (apiBaseUrl: string): AuthSessionState => {
  const now = Date.now();
  return {
    access_token: `dev-access-${now}`,
    refresh_token: `dev-refresh-${now}`,
    is_new_user: false,
    user: {
      id: "dev-local-user",
      status: "active"
    },
    challenge_id: "dev-local-mock",
    provider: "telegram",
    api_base_url: apiBaseUrl,
    created_at: new Date().toISOString()
  };
};

interface CachedSubscriptionLink {
  deviceId: string;
  subscriptionUrl: string;
  cachedAt: string;
}

const SUBSCRIPTION_LINK_CACHE_VERSION = "happ-1";
const FALLBACK_LINK_CACHE_TTL_MS = 60 * 60 * 1000;
const HAPP_INSTALL_LIMIT = 2;

function shouldFallbackToRawSubscriptionLink(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === "HAPP_CONFIGURATION_ERROR" ||
    error.code === "HAPP_LIMITED_LINK_ERROR" ||
    error.code === "HAPP_CRYPTO_ERROR" ||
    error.status >= 500
  );
}

function normalizeSubscriptionUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.searchParams.delete("format");
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function buildSubscriptionLinkStorageKey(apiBaseUrl: string, deviceId: string): string {
  return `dostup:subscription-link:${SUBSCRIPTION_LINK_CACHE_VERSION}:${apiBaseUrl}:${deviceId}`;
}

function readCachedSubscriptionLink(apiBaseUrl: string, deviceId: string): CachedSubscriptionLink | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const raw = window.localStorage.getItem(buildSubscriptionLinkStorageKey(apiBaseUrl, deviceId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CachedSubscriptionLink;
    const normalizedSubscriptionUrl = normalizeSubscriptionUrl(parsed.subscriptionUrl);
    const cachedAtTimestamp = Date.parse(parsed.cachedAt);
    if (
      parsed.deviceId !== deviceId ||
      typeof normalizedSubscriptionUrl !== "string" ||
      normalizedSubscriptionUrl.length < 20 ||
      typeof parsed.cachedAt !== "string" ||
      Number.isNaN(cachedAtTimestamp) ||
      cachedAtTimestamp + FALLBACK_LINK_CACHE_TTL_MS <= Date.now()
    ) {
      window.localStorage.removeItem(buildSubscriptionLinkStorageKey(apiBaseUrl, deviceId));
      return null;
    }

    return {
      ...parsed,
      subscriptionUrl: normalizedSubscriptionUrl
    };
  } catch {
    window.localStorage.removeItem(buildSubscriptionLinkStorageKey(apiBaseUrl, deviceId));
    return null;
  }
}

function writeCachedSubscriptionLink(apiBaseUrl: string, deviceId: string, subscriptionUrl: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const payload: CachedSubscriptionLink = {
    deviceId,
    subscriptionUrl,
    cachedAt: new Date().toISOString()
  };

  window.localStorage.setItem(buildSubscriptionLinkStorageKey(apiBaseUrl, deviceId), JSON.stringify(payload));
}

function removeCachedSubscriptionLink(apiBaseUrl: string, deviceId: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(buildSubscriptionLinkStorageKey(apiBaseUrl, deviceId));
}

export const AuthPage = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState(authFlags.defaultApiBaseUrl);
  const [provider, setProvider] = useState<AuthProvider>("telegram");
  const [email, setEmail] = useState("dev@dostup.local");
  const [phone, setPhone] = useState("+79990000000");
  const [code, setCode] = useState("");
  const [devRouteActive, setDevRouteActive] = useState(() =>
    authFlags.enableDevLogin ? isDevRoute(window.location.pathname, window.location.search) : false
  );
  const [registeredDeviceId, setRegisteredDeviceId] = useState("");
  const [isRegisteringDevice, setIsRegisteringDevice] = useState(false);
  const [isIssuingLink, setIsIssuingLink] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isUpdatingRouting, setIsUpdatingRouting] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState("");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionMeResponse | null>(null);
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const autoTelegramStartAttemptedRef = useRef(false);
  const isDevPanelVisible = authFlags.enableDevLogin && devRouteActive;

  const { challengeId, debugCode, status, statusError, session, isStarting, isVerifying } = useUnit({
    challengeId: outputs.$challengeId,
    debugCode: outputs.$debugCode,
    status: outputs.$status,
    statusError: outputs.$statusError,
    session: outputs.$session,
    isStarting: outputs.$isStarting,
    isVerifying: outputs.$isVerifying
  });

  useEffect(() => {
    inputs.restoreSession();
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, []);

  useEffect(() => {
    if (!authFlags.enableDevLogin) {
      setDevRouteActive(false);
      return;
    }

    const syncRoute = () => {
      setDevRouteActive(isDevRoute(window.location.pathname, window.location.search));
    };

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    if (isDevPanelVisible) {
      return;
    }

    if (session || isStarting || isVerifying || autoTelegramStartAttemptedRef.current) {
      return;
    }

    const telegramInitData = window.Telegram?.WebApp?.initData?.trim() || "";
    if (!telegramInitData) {
      return;
    }

    autoTelegramStartAttemptedRef.current = true;
    inputs.startLogin({
      apiBaseUrl,
      provider: "telegram",
      telegram_init_data: telegramInitData
    });
  }, [apiBaseUrl, inputs, isDevPanelVisible, isStarting, isVerifying, session]);

  const openDevPanel = () => {
    if (!authFlags.enableDevLogin) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("dev", "1");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setDevRouteActive(true);
  };

  const openProduction = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("dev");
    if (url.pathname === "/dev-login") {
      url.pathname = "/";
    }
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setDevRouteActive(false);
  };

  const startTelegramLogin = () => {
    const telegramInitData = window.Telegram?.WebApp?.initData?.trim() || "";
    if (!telegramInitData) {
      inputs.setClientStatus({
        message: "Откройте Mini App внутри Telegram, чтобы продолжить Telegram-вход.",
        isError: true
      });
      return false;
    }

    autoTelegramStartAttemptedRef.current = true;
    inputs.startLogin({
      apiBaseUrl,
      provider: "telegram",
      telegram_init_data: telegramInitData
    });
    setCode("");
    return true;
  };

  const start = (selectedProvider: AuthProvider) => {
    if (selectedProvider === "telegram") {
      startTelegramLogin();
      return;
    }

    if (selectedProvider === "email") {
      inputs.startLogin({
        apiBaseUrl,
        provider: "email",
        email: email.trim()
      });
      setCode("");
      return;
    }

    inputs.startLogin({
      apiBaseUrl,
      provider: "phone",
      phone_e164: phone.trim(),
      channel: "sms"
    });
    setCode("");
  };

  const verify = (rawChallengeId: string, rawCode: string, selectedProvider: AuthProvider) => {
    const normalizedChallengeId = rawChallengeId.trim();
    const normalizedCode = rawCode.trim() || (selectedProvider === "telegram" ? "telegram" : "");

    if (!normalizedChallengeId || !normalizedCode) {
      return;
    }

    inputs.verifyLogin({
      apiBaseUrl,
      provider: selectedProvider,
      challenge_id: normalizedChallengeId,
      code: normalizedCode
    });
  };

  const resetAuthState = () => {
    setCode("");
    setRegisteredDeviceId("");
    setSubscriptionUrl("");
    setSubscriptionExpiresAt("");
    setIsCopied(false);
    setPlans([]);
    setSubscription(null);
    setDevices([]);
    inputs.clearChallenge();
    inputs.clearSession();
  };

  const createFakeSession = () => {
    inputs.setSession(buildMockSession(apiBaseUrl));
  };

  const canRetryTelegram = !window.Telegram?.WebApp?.initData?.trim() || statusError;
  const isDeviceReady = registeredDeviceId.length > 0;
  const displayStatus =
    status === "Готово к входу" && window.Telegram?.WebApp?.initData?.trim() ? "Подключаем Telegram..." : status;
  const visibleErrorMessage = statusError ? displayStatus : undefined;

  const restartTelegramSession = () => {
    setRegisteredDeviceId("");
    setSubscriptionUrl("");
    setSubscriptionExpiresAt("");
    setIsCopied(false);
    setPlans([]);
    setSubscription(null);
    setDevices([]);
    inputs.clearChallenge();
    inputs.clearSession();
    inputs.setClientStatus({
      message: "Сессия обновляется через Telegram...",
      isError: false
    });

    autoTelegramStartAttemptedRef.current = false;
    startTelegramLogin();
  };

  const handleAuthorizedError = (error: unknown, fallbackMessage: string): string | null => {
    if (error instanceof ApiError && error.status === 401) {
      restartTelegramSession();
      return null;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallbackMessage;
  };

  useEffect(() => {
    if (!session) {
      autoTelegramStartAttemptedRef.current = false;
      setRegisteredDeviceId("");
      setSubscriptionUrl("");
      setSubscriptionExpiresAt("");
      setIsCopied(false);
      setPlans([]);
      setSubscription(null);
      setDevices([]);
      setIsRegisteringDevice(false);
      setIsLoadingSubscription(false);
      setIsPaying(false);
      setIsUpdatingRouting(false);
      return;
    }

    let cancelled = false;

    const syncDevice = async () => {
      setIsRegisteringDevice(true);
      setSubscriptionUrl("");
      setSubscriptionExpiresAt("");

      try {
        const deviceRegistration = await getOrCreateDeviceRegistration();
        const device = await registerDevice(session.api_base_url, session.access_token, deviceRegistration);
        if (cancelled) {
          return;
        }

        setRegisteredDeviceId(device.id);
        inputs.setClientStatus({
          message: "Устройство готово. Можно выдать ссылку.",
          isError: false
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = handleAuthorizedError(error, "Не удалось зарегистрировать устройство");
        if (!message) {
          return;
        }

        inputs.setClientStatus({
          message,
          isError: true
        });
      } finally {
        if (!cancelled) {
          setIsRegisteringDevice(false);
        }
      }
    };

    void syncDevice();

    return () => {
      cancelled = true;
    };
  }, [inputs, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const loadSubscriptionManager = async () => {
      setIsLoadingSubscription(true);

      try {
        const [plansResponse, subscriptionResponse, devicesResponse] = await Promise.all([
          getPlans(session.api_base_url),
          getSubscriptionMe(session.api_base_url, session.access_token),
          getDevices(session.api_base_url, session.access_token)
        ]);

        if (cancelled) {
          return;
        }

        setPlans(plansResponse);
        setSubscription(subscriptionResponse);
        setDevices(devicesResponse);
        inputs.setClientStatus({
          message:
            subscriptionResponse.subscription?.status === "active"
              ? "Подписка активна."
              : "Данные подписки загружены.",
          isError: false
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = handleAuthorizedError(error, "Не удалось загрузить подписку");
        if (!message) {
          return;
        }

        inputs.setClientStatus({
          message,
          isError: true
        });
      } finally {
        if (!cancelled) {
          setIsLoadingSubscription(false);
        }
      }
    };

    void loadSubscriptionManager();

    return () => {
      cancelled = true;
    };
  }, [inputs, session]);

  useEffect(() => {
    if (provider === "email" && !authFlags.allowEmailLogin) {
      setProvider("telegram");
      return;
    }

    if (provider === "phone" && !authFlags.allowPhoneLogin) {
      setProvider("telegram");
    }
  }, [provider]);

  const handleIssueLink = async (options?: { forceReissue?: boolean }) => {
    const subscriptionId = subscription?.subscription?.id;
    if (!session || !registeredDeviceId || !subscriptionId) {
      return;
    }

    setIsIssuingLink(true);
    setSubscriptionUrl("");
    setSubscriptionExpiresAt("");
    setIsCopied(false);

    try {
      if (options?.forceReissue) {
        removeCachedSubscriptionLink(session.api_base_url, registeredDeviceId);
        const rawResult = await reissueRawSubscriptionLink(
          session.api_base_url,
          session.access_token,
          registeredDeviceId
        );

        try {
          const result = await issueSubscriptionLink(
            session.api_base_url,
            session.access_token,
            subscriptionId,
            registeredDeviceId,
            HAPP_INSTALL_LIMIT
          );
          const preferredSubscriptionUrl = normalizeSubscriptionUrl(result.link);
          setSubscriptionUrl(preferredSubscriptionUrl);
          setSubscriptionExpiresAt("");
          writeCachedSubscriptionLink(session.api_base_url, registeredDeviceId, preferredSubscriptionUrl);
          inputs.setClientStatus({
            message: "Ссылка перевыпущена.",
            isError: false
          });
          return;
        } catch (happError) {
          if (!shouldFallbackToRawSubscriptionLink(happError)) {
            throw happError;
          }

          const fallbackUrl = normalizeSubscriptionUrl(rawResult.subscription_url);
          setSubscriptionUrl(fallbackUrl);
          setSubscriptionExpiresAt(rawResult.expires_at);
          writeCachedSubscriptionLink(session.api_base_url, registeredDeviceId, fallbackUrl);
          inputs.setClientStatus({
            message: "Ссылка перевыпущена в обычном формате.",
            isError: false
          });
          return;
        }
      }

      try {
        const result = await issueSubscriptionLink(
          session.api_base_url,
          session.access_token,
          subscriptionId,
          registeredDeviceId,
          HAPP_INSTALL_LIMIT
        );
        const preferredSubscriptionUrl = normalizeSubscriptionUrl(result.link);
        setSubscriptionUrl(preferredSubscriptionUrl);
        setSubscriptionExpiresAt("");
        writeCachedSubscriptionLink(session.api_base_url, registeredDeviceId, preferredSubscriptionUrl);
        inputs.setClientStatus({
          message: "Ссылка готова.",
          isError: false
        });
      } catch (happError) {
        if (!shouldFallbackToRawSubscriptionLink(happError)) {
          throw happError;
        }

        const rawResult = await issueRawSubscriptionLink(
          session.api_base_url,
          session.access_token,
          registeredDeviceId
        );
        const fallbackUrl = normalizeSubscriptionUrl(rawResult.subscription_url);
        setSubscriptionUrl(fallbackUrl);
        setSubscriptionExpiresAt(rawResult.expires_at);
        writeCachedSubscriptionLink(session.api_base_url, registeredDeviceId, fallbackUrl);
        inputs.setClientStatus({
          message: "Ссылка готова в обычном формате.",
          isError: false
        });
      }
    } catch (error) {
      const message = handleAuthorizedError(error, "Не удалось выдать ссылку");
      if (!message) {
        return;
      }

      inputs.setClientStatus({
        message,
        isError: true
      });
    } finally {
      setIsIssuingLink(false);
    }
  };

  const handleReissueLink = async () => {
    await handleIssueLink({ forceReissue: true });
  };

  useEffect(() => {
    if (
      !session ||
      !registeredDeviceId ||
      !subscription?.subscription?.id ||
      subscriptionUrl ||
      isRegisteringDevice ||
      isIssuingLink ||
      isLoadingSubscription
    ) {
      return;
    }

    const cachedLink = readCachedSubscriptionLink(session.api_base_url, registeredDeviceId);
    if (cachedLink) {
      setSubscriptionUrl(cachedLink.subscriptionUrl);
      setSubscriptionExpiresAt("");
      inputs.setClientStatus({
        message: "Ссылка готова.",
        isError: false
      });
      return;
    }

    void handleIssueLink();
  }, [isIssuingLink, isLoadingSubscription, isRegisteringDevice, registeredDeviceId, session, subscription, subscriptionUrl]);

  const handleMockPay = async () => {
    if (!session) {
      return;
    }

    const targetPlanId = subscription?.plan.id ?? plans[0]?.id;
    if (!targetPlanId) {
      inputs.setClientStatus({
        message: "Нет доступного тарифа для продления.",
        isError: true
      });
      return;
    }

    setIsPaying(true);
    try {
      const result = await mockPaySubscription(session.api_base_url, session.access_token, targetPlanId);
      setSubscription(result.subscription);
      const devicesResponse = await getDevices(session.api_base_url, session.access_token);
      setDevices(devicesResponse);
      inputs.setClientStatus({
        message: "Моковая оплата прошла. Доступ продлен на 1 месяц.",
        isError: false
      });
    } catch (error) {
      const message = handleAuthorizedError(error, "Не удалось продлить доступ");
      if (!message) {
        return;
      }

      inputs.setClientStatus({
        message,
        isError: true
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleCopyLink = async () => {
    if (!subscriptionUrl) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(subscriptionUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = subscriptionUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setIsCopied(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      inputs.setClientStatus({
        message: "Ссылка скопирована.",
        isError: false
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось скопировать ссылку";
      inputs.setClientStatus({
        message,
        isError: true
      });
    }
  };

  const handleUpdateRoutingMode = async (routingMode: DeviceRoutingMode) => {
    if (!session || !registeredDeviceId) {
      return;
    }

    setIsUpdatingRouting(true);
    try {
      const updated = await updateDeviceRouting(session.api_base_url, session.access_token, registeredDeviceId, routingMode);
      setDevices((current) => current.map((device) => (device.id === updated.id ? updated : device)));
      if (subscriptionUrl) {
        setIsCopied(false);
      }
      inputs.setClientStatus({
        message:
          routingMode === "ru_bypass"
            ? "Российские сервисы будут открываться напрямую после обновления подписки в клиенте."
            : "Полный VPN-режим включен. Перезапустите VPN или обновите подписку в клиенте.",
        isError: false
      });
    } catch (error) {
      const message = handleAuthorizedError(error, "Не удалось сохранить режим маршрутизации");
      if (!message) {
        return;
      }

      inputs.setClientStatus({
        message,
        isError: true
      });
    } finally {
      setIsUpdatingRouting(false);
    }
  };

  if (isDevPanelVisible) {
    return (
      <DevOnly enabled={authFlags.enableDevLogin}>
        <DevLoginPanel
          appEnv={authFlags.appEnv}
          apiBaseUrl={apiBaseUrl}
          provider={provider}
          email={email}
          phone={phone}
          code={code}
          challengeId={challengeId}
          debugCode={debugCode}
          status={status}
          statusError={statusError}
          session={session}
          isStarting={isStarting}
          isVerifying={isVerifying}
          showDevCodeHint={authFlags.showDevCodeHint}
          onProviderChange={setProvider}
          onApiBaseUrlChange={setApiBaseUrl}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onCodeChange={setCode}
          onStart={() => start(provider)}
          onVerify={verify}
          onReset={resetAuthState}
          onCreateFakeSession={createFakeSession}
          onOpenProduction={openProduction}
        />
      </DevOnly>
    );
  }

  if (session) {
    return (
      <SubscriptionManagerPage
        errorMessage={visibleErrorMessage}
        statusError={statusError}
        subscription={subscription}
        plans={plans}
        devices={devices}
        currentDeviceId={registeredDeviceId}
        isLoadingSubscription={isLoadingSubscription}
        isDeviceReady={isDeviceReady}
        isRegisteringDevice={isRegisteringDevice}
        isIssuingLink={isIssuingLink}
        isPaying={isPaying}
        isUpdatingRouting={isUpdatingRouting}
        subscriptionUrl={subscriptionUrl}
        expiresAt={subscriptionExpiresAt}
        isCopied={isCopied}
        onCopyLink={handleCopyLink}
        onReissueLink={handleReissueLink}
        onMockPay={handleMockPay}
        onUpdateRoutingMode={handleUpdateRoutingMode}
      />
    );
  }

  return (
    <ProductionLoginCard
      errorMessage={visibleErrorMessage}
      statusError={statusError}
      canRetryTelegram={canRetryTelegram}
      onRetryTelegram={() => start("telegram")}
      canOpenDevPanel={authFlags.enableDevLogin}
      onOpenDevPanel={openDevPanel}
    />
  );
};
