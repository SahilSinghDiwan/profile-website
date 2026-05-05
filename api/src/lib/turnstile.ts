export interface TurnstileResult {
  ok: boolean;
  errorCodes?: string[];
}

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  secret: string | undefined,
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured");
  }
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  const res = await fetch(VERIFY_URL, { method: "POST", body });
  if (!res.ok) {
    return { ok: false, errorCodes: [`http_${res.status}`] };
  }
  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  return { ok: !!data.success, errorCodes: data["error-codes"] };
}
