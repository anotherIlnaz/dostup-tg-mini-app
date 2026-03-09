import { postJson } from "../../../api/http";
import type {
  AuthStartRequest,
  AuthStartResponse,
  DeviceRoutingMode,
  DeviceRegistrationRequest,
  DeviceResponse,
  MockPayResponse,
  PlanSummary,
  SubscriptionMeResponse,
  SubscriptionLinkResponse,
  AuthVerifyRequest,
  AuthVerifyResponse
} from "../../../api/types";

export const startAuth = (apiBaseUrl: string, payload: AuthStartRequest): Promise<AuthStartResponse> =>
  postJson(apiBaseUrl, "/v1/auth/start", payload);

export const verifyAuth = (apiBaseUrl: string, payload: AuthVerifyRequest): Promise<AuthVerifyResponse> =>
  postJson(apiBaseUrl, "/v1/auth/verify", payload);

export const registerDevice = (
  apiBaseUrl: string,
  accessToken: string,
  payload: DeviceRegistrationRequest
): Promise<DeviceResponse> =>
  postJson(apiBaseUrl, "/v1/devices", payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

export const getDevices = (
  apiBaseUrl: string,
  accessToken: string
): Promise<DeviceResponse[]> =>
  postJson(
    apiBaseUrl,
    "/v1/devices",
    undefined,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

export const updateDeviceRouting = (
  apiBaseUrl: string,
  accessToken: string,
  deviceId: string,
  routingMode: DeviceRoutingMode
): Promise<DeviceResponse> =>
  postJson(
    apiBaseUrl,
    `/v1/devices/${deviceId}/routing`,
    {
      routing_mode: routingMode
    },
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

export const issueSubscriptionLink = (
  apiBaseUrl: string,
  accessToken: string,
  deviceId: string
): Promise<SubscriptionLinkResponse> =>
  postJson(
    apiBaseUrl,
    "/v1/sub/link",
    {
      device_id: deviceId
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Device-Id": deviceId
      }
    }
  );

export const getSubscriptionMe = (
  apiBaseUrl: string,
  accessToken: string
): Promise<SubscriptionMeResponse> =>
  postJson(
    apiBaseUrl,
    "/v1/subscription/me",
    undefined,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

export const getPlans = (apiBaseUrl: string): Promise<PlanSummary[]> =>
  postJson(apiBaseUrl, "/v1/plans", undefined, { method: "GET" });

export const mockPaySubscription = (
  apiBaseUrl: string,
  accessToken: string,
  planId: string
): Promise<MockPayResponse> =>
  postJson(
    apiBaseUrl,
    "/v1/subscription/mock-pay",
    {
      plan_id: planId
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
