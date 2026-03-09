import type { DevicePlatform, DeviceRegistrationRequest } from "../../../api/types";

const installIdStorageKey = "dostup.tg.install-id";
const publicKeyStorageKey = "dostup.tg.device-public-key";

function getInstallId(): string {
  const existing = window.localStorage.getItem(installIdStorageKey)?.trim();
  if (existing) {
    return existing;
  }

  const created =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `install-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(installIdStorageKey, created);
  return created;
}

function detectPlatform(): DevicePlatform {
  const telegramPlatform = window.Telegram?.WebApp?.platform?.toLowerCase() ?? "";
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (telegramPlatform === "ios" || /iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }

  if (telegramPlatform === "android" || userAgent.includes("android")) {
    return "android";
  }

  if (telegramPlatform === "macos" || userAgent.includes("mac os")) {
    return "macos";
  }

  return "windows";
}

function buildDeviceName(platform: DevicePlatform): string {
  switch (platform) {
    case "ios":
      return "Telegram Mini App iPhone";
    case "android":
      return "Telegram Mini App Android";
    case "macos":
      return "Telegram Mini App macOS";
    case "windows":
    default:
      return "Telegram Mini App Windows";
  }
}

function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

function toPem(label: string, base64: string): string {
  const wrapped = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----`;
}

async function generatePublicKeyPem(): Promise<string> {
  const existing = window.localStorage.getItem(publicKeyStorageKey)?.trim();
  if (existing) {
    return existing;
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const pem = toPem("PUBLIC KEY", toBase64(publicKey));
  window.localStorage.setItem(publicKeyStorageKey, pem);
  return pem;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((chunk) => chunk.toString(16).padStart(2, "0"))
    .join("");
}

export async function getOrCreateDeviceRegistration(): Promise<DeviceRegistrationRequest> {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is not available");
  }

  const installId = getInstallId();
  const platform = detectPlatform();
  const name = buildDeviceName(platform);
  const publicKey = await generatePublicKeyPem();
  const fingerprintHash = await sha256Hex(
    `${installId}:${platform}:${window.Telegram?.WebApp?.platform ?? "telegram"}:${window.navigator.userAgent}`
  );

  return {
    platform,
    name,
    fingerprint_hash: fingerprintHash,
    public_key: publicKey
  };
}
