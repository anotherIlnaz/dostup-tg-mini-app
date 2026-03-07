export type AuthProvider = "telegram" | "email" | "phone";

export interface AuthStartRequest {
  provider: AuthProvider;
  telegram_init_data?: string;
  email?: string;
  phone_e164?: string;
  channel?: "sms" | "voice";
}

export interface AuthStartResponse {
  challenge_id: string;
  expires_in: number;
  debug_code?: string;
}

export interface AuthVerifyRequest {
  challenge_id: string;
  code: string;
}

export interface AuthVerifyResponse {
  access_token: string;
  refresh_token: string;
  is_new_user: boolean;
  user: {
    id: string;
    status: string;
  };
}

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export interface AuthSessionState extends AuthVerifyResponse {
  challenge_id: string;
  provider: AuthProvider;
  api_base_url: string;
  created_at: string;
}
