export type AuthProvider = "telegram" | "email" | "phone";

export type PostLoginConfigStatus =
  | "issued"
  | "device_required"
  | "subscription_required"
  | "profile_unavailable";

export interface PostLoginProfileSummary {
  expires_at?: string;
  pool_id?: string;
  node_id?: string;
  wireguard_config?: string;
}

export interface PostLoginConfig {
  status: PostLoginConfigStatus;
  error_code?: string;
  expires_at?: string;
  pool_id?: string;
  node_id?: string;
  profile?: PostLoginProfileSummary;
}

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
  post_login_config?: PostLoginConfig;
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

export type DevicePlatform = "ios" | "android" | "windows" | "macos";
export type DeviceRoutingMode = "full" | "ru_bypass";

export interface DeviceRegistrationRequest {
  platform: DevicePlatform;
  name: string;
  fingerprint_hash: string;
  public_key: string;
}

export interface DeviceResponse {
  id: string;
  user_id: string;
  platform: DevicePlatform;
  name: string;
  fingerprint_hash: string;
  public_key: string;
  status: string;
  routing_mode: DeviceRoutingMode;
  created_at: string;
  updated_at?: string;
  last_seen_at?: string | null;
}

export interface SubscriptionLinkResponse {
  subscription_url: string;
  expires_at: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  price_amount: number;
  currency: string;
  period: string;
  device_limit: number;
}

export interface SubscriptionSummary {
  id: string;
  status: string;
  period_start: string;
  period_end: string;
  renews_at?: string | null;
  cancel_at_period_end: boolean;
  provider: string;
}

export interface SubscriptionUsage {
  active_devices: number;
  device_limit: number;
}

export interface SubscriptionMeResponse {
  status: "none" | "trialing" | "active" | "past_due" | "paused" | "canceled" | "expired";
  plan: PlanSummary;
  subscription?: SubscriptionSummary;
  usage: SubscriptionUsage;
  remaining_seconds: number;
  remaining_days: number;
}

export interface MockPayResponse {
  ok: boolean;
  payment_id: string;
  subscription: SubscriptionMeResponse;
}
