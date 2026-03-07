import { postJson } from "../../../api/http";
import type {
  AuthStartRequest,
  AuthStartResponse,
  AuthVerifyRequest,
  AuthVerifyResponse
} from "../../../api/types";

export const startAuth = (apiBaseUrl: string, payload: AuthStartRequest): Promise<AuthStartResponse> =>
  postJson(apiBaseUrl, "/v1/auth/start", payload);

export const verifyAuth = (apiBaseUrl: string, payload: AuthVerifyRequest): Promise<AuthVerifyResponse> =>
  postJson(apiBaseUrl, "/v1/auth/verify", payload);
