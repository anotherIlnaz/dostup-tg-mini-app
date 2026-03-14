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

interface JsonRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  headers?: HeadersInit;
}

export async function postJson<TResponse>(
  baseUrl: string,
  path: string,
  body: unknown,
  options?: JsonRequestOptions
): Promise<TResponse> {
  const normalizedBase = baseUrl.trim().replace(/\/+$/, "");
  const method = options?.method ?? "POST";
  let response: Response;

  try {
    response = await fetch(`${normalizedBase}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      ...(method === "GET" ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new ApiError("Не удалось подключиться к серверу. Повторите попытку.", 0, "NETWORK_ERROR");
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || payload.message || `HTTP ${response.status}`,
      response.status,
      payload.error?.code || payload.code
    );
  }

  return payload as TResponse;
}
