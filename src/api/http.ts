import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJson<TResponse>(baseUrl: string, path: string, body: unknown): Promise<TResponse> {
  const normalizedBase = baseUrl.trim().replace(/\/+$/, "");
  const response = await fetch(`${normalizedBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || `HTTP ${response.status}`,
      response.status,
      payload.error?.code
    );
  }

  return payload as TResponse;
}
