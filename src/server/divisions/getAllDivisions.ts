import "server-only";
import { cache } from "react";
import { fetchExternalApiJson, ExternalApiError } from "@/server/externalApi";
import type { DivisionInfo } from "@/types/interface";

export const getAllDivisions = cache(async (): Promise<DivisionInfo[]> => {
  try {
    const response = await fetchExternalApiJson(process.env.USER_MANAGEMENT_API_URL_DIVISIONS, process.env.USER_MANAGEMENT_DB_KEY);
    if (typeof response !== "object" || response === null || !("data" in response) || !Array.isArray(response.data)) {
      throw new ExternalApiError("invalid_response");
    }
    return response.data as DivisionInfo[];
  } catch (error) {
    if (error instanceof ExternalApiError) {
      console.warn("[getAllDivisions] division API unavailable:", error.kind);
      throw new Error("部署情報を取得できませんでした。時間をおいて再度お試しください。");
    }
    throw error;
  }
});
