const normalize = (value?: string): string => (value || "").trim().toLowerCase();

const normalizeAppEnv = (value?: string): string => {
  const normalized = normalize(value);
  return normalized === "staging" ? "stage" : normalized;
};

const appEnv = normalizeAppEnv(import.meta.env.VITE_APP_ENV || import.meta.env.MODE || "development");
const isProductionLikeEnv = appEnv === "production" || appEnv === "stage";
const isProductionEnv = import.meta.env.PROD || isProductionLikeEnv;
const explicitDevFlag = normalize(import.meta.env.VITE_ENABLE_DEV_LOGIN) === "true";
const allowDevCodeHint = normalize(import.meta.env.VITE_ALLOW_DEV_CODE_HINT) === "true";

export const authFlags = {
  appEnv,
  isProductionLikeEnv,
  defaultApiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001",
  enableDevLogin: !isProductionEnv && (import.meta.env.DEV || explicitDevFlag),
  showDevCodeHint: !isProductionEnv && (import.meta.env.DEV || allowDevCodeHint),
  allowEmailLogin: !isProductionLikeEnv,
  allowPhoneLogin: !isProductionLikeEnv
};

export const isDevRoute = (pathname: string, search: string): boolean => {
  if (pathname === "/dev-login") {
    return true;
  }

  const params = new URLSearchParams(search);
  return params.get("dev") === "1";
};
