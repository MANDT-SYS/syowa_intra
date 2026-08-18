import "server-only";

export type ExternalApiErrorKind = "configuration" | "timeout" | "http" | "network" | "invalid_response";

export class ExternalApiError extends Error {
  constructor(public readonly kind: ExternalApiErrorKind) {
    super("外部APIの取得に失敗しました。");
    this.name = "ExternalApiError";
  }
}

const EXTERNAL_API_TIMEOUT_MS = 10_000;

export async function fetchExternalApiJson(apiUrl: string | undefined, apiKey: string | undefined): Promise<unknown> {
  if (!apiUrl || !apiKey) throw new ExternalApiError("configuration");
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(EXTERNAL_API_TIMEOUT_MS),
    });
    if (!response.ok) throw new ExternalApiError("http");
    try { return await response.json(); }
    catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") throw new ExternalApiError("timeout");
      throw new ExternalApiError("invalid_response");
    }
  } catch (error) {
    if (error instanceof ExternalApiError) throw error;
    if (error instanceof Error && error.name === "TimeoutError") throw new ExternalApiError("timeout");
    throw new ExternalApiError("network");
  }
}
