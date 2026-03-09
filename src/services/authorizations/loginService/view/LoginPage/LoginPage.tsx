/*
Legacy LoginPage archived on 2026-03-08.
This code is intentionally commented out to keep the previous implementation
available for reference without participating in runtime or build paths.

import { useState } from "react";
import type { AuthProvider } from "../../../../../api/types";
import type { LoginPageProps } from "./LoginPage.types";
import {
  Actions,
  Button,
  Card,
  Hero,
  Hint,
  InlineTabs,
  Input,
  Label,
  Page,
  Session,
  Status,
  Tabs
} from "./LoginPage.styled";

export const LoginPage = ({
  apiBaseUrl,
  mode,
  challengeId,
  debugCode,
  session,
  status,
  statusError,
  isStarting,
  isVerifying,
  onModeChange,
  onApiBaseUrlChange,
  onStart,
  onVerify,
  onClearSession
}: LoginPageProps) => {
  const [provider, setProvider] = useState<AuthProvider>("telegram");
  const [email, setEmail] = useState("dev@dostup.local");
  const [phone, setPhone] = useState("+79990000000");
  const [code, setCode] = useState("");

  const start = async () => {
    if (provider === "email") {
      await onStart(provider, email.trim());
      return;
    }
    if (provider === "phone") {
      await onStart(provider, phone.trim());
      return;
    }
    await onStart(provider);
  };

  return (
    <Page>
      <Hero>
        <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.12em", opacity: 0.8 }}>ДОСТУП</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 32, lineHeight: 1.05 }}>Telegram Mini App</h1>
        <p style={{ margin: 0 }}>
          Тестовый контур авторизации. Режим: {mode === "registration" ? "регистрация" : "вход"}.
        </p>
      </Hero>

      <Card>
        <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>Сервис</h2>
        <Label htmlFor="apiBaseUrl">Адрес API</Label>
        <Input
          id="apiBaseUrl"
          value={apiBaseUrl}
          onChange={(event) => onApiBaseUrlChange(event.target.value)}
          placeholder="http://127.0.0.1:3001"
        />
        <Hint>Для локальной проверки используй API на 3001.</Hint>
      </Card>

      <Card>
        <Tabs>
          <Button type="button" $active={mode === "login"} onClick={() => onModeChange("login")}>
            Вход
          </Button>
          <Button type="button" $active={mode === "registration"} onClick={() => onModeChange("registration")}>
            Регистрация
          </Button>
        </Tabs>

        <Label>Способ</Label>
        <InlineTabs>
          <Button type="button" $active={provider === "telegram"} onClick={() => setProvider("telegram")}>
            Telegram
          </Button>
          <Button type="button" $active={provider === "email"} onClick={() => setProvider("email")}>
            Email
          </Button>
          <Button type="button" $active={provider === "phone"} onClick={() => setProvider("phone")}>
            Телефон
          </Button>
        </InlineTabs>

        {provider === "email" && (
          <>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </>
        )}

        {provider === "phone" && (
          <>
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </>
        )}

        <Button type="button" onClick={start} disabled={isStarting}>
          {provider === "telegram" ? "Войти через Telegram" : "Получить код"}
        </Button>

        <Label htmlFor="challenge">Challenge ID</Label>
        <Input id="challenge" value={challengeId} readOnly />

        <Label htmlFor="code">Код</Label>
        <Input
          id="code"
          value={code || debugCode}
          onChange={(event) => setCode(event.target.value)}
          placeholder={provider === "telegram" ? "telegram" : "OTP-код"}
        />

        <Button
          type="button"
          $variant="secondary"
          onClick={() => onVerify(challengeId, code || debugCode, provider)}
          disabled={isVerifying || !challengeId}
        >
          Подтвердить
        </Button>
      </Card>

      <Card>
        <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>Сессия</h2>
        <Session>{session ? JSON.stringify(session, null, 2) : "Сессия не создана"}</Session>
        <Actions>
          <Button type="button" $variant="ghost" onClick={onClearSession}>
            Сбросить
          </Button>
        </Actions>
      </Card>

      <Card>
        <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>Статус</h2>
        <Status $isError={statusError}>{status}</Status>
      </Card>
    </Page>
  );
};
*/
