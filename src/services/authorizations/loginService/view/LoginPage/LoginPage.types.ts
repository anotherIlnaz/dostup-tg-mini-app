/*
Legacy LoginPage types archived on 2026-03-08.

import type { AuthProvider, AuthSessionState } from "../../../../../api/types";

export interface LoginPageProps {
  apiBaseUrl: string;
  mode: "login" | "registration";
  challengeId: string;
  debugCode: string;
  session: AuthSessionState | null;
  status: string;
  statusError: boolean;
  isStarting: boolean;
  isVerifying: boolean;
  onModeChange: (mode: "login" | "registration") => void;
  onApiBaseUrlChange: (value: string) => void;
  onStart: (provider: AuthProvider, value?: string) => Promise<void>;
  onVerify: (challengeId: string, code: string, provider: AuthProvider) => Promise<void>;
  onClearSession: () => void;
}
*/
