/*
Legacy login container archived on 2026-03-08.
Runtime path now uses:
- src/App/App.tsx
- src/features/auth/pages/AuthPage.tsx

Previous implementation:

import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import type { AuthProvider } from "../../../api/types";
import { loginService } from "./loginService.model";
import { LoginPage } from "./view/LoginPage";

const { inputs, outputs } = loginService;

export const LoginContainer = () => {
  const [mode, setMode] = useState<"login" | "registration">("login");
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:3001");
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

  const handleStart = async (provider: AuthProvider, value?: string) => {
    if (provider === "telegram") {
      inputs.startLogin({
        apiBaseUrl,
        provider,
        telegram_init_data: window.Telegram?.WebApp?.initData || ""
      });
      return;
    }

    if (provider === "email") {
      inputs.startLogin({
        apiBaseUrl,
        provider,
        email: value
      });
      return;
    }

    inputs.startLogin({
      apiBaseUrl,
      provider,
      phone_e164: value,
      channel: "sms"
    });
  };

  const handleVerify = async (rawChallengeId: string, code: string, provider: AuthProvider) => {
    const challengeId = rawChallengeId.trim();
    const normalizedCode = code.trim() || (provider === "telegram" ? "telegram" : "");
    if (!challengeId || !normalizedCode) {
      return;
    }

    inputs.verifyLogin({
      apiBaseUrl,
      provider,
      challenge_id: challengeId,
      code: normalizedCode
    });
  };

  return (
    <LoginPage
      apiBaseUrl={apiBaseUrl}
      mode={mode}
      challengeId={challengeId}
      debugCode={debugCode}
      session={session}
      status={status}
      statusError={statusError}
      isStarting={isStarting}
      isVerifying={isVerifying}
      onModeChange={setMode}
      onApiBaseUrlChange={setApiBaseUrl}
      onStart={handleStart}
      onVerify={handleVerify}
      onClearSession={inputs.clearSession}
    />
  );
};
*/
