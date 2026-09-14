import "server-only";

import { fetchExternalApiJson } from "@/server/externalApi";
import type { EmploymentStatus } from "@/types/interface";

const CACHE_TTL_MS = 10 * 60 * 1000;

let employmentStatusesCache:
  | { value: EmploymentStatus[]; expiresAt: number }
  | null = null;

const isEmploymentStatus = (value: unknown): value is EmploymentStatus =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  "employmentStatus" in value &&
  typeof value.employmentStatus === "string" &&
  "activate" in value &&
  typeof value.activate === "number";

/** 雇用形態マスタを補助情報として取得する。失敗時はHeaderを止めず空配列を返す。 */
export const getAllEmploymentStatuses = async (): Promise<EmploymentStatus[]> => {
  const now = Date.now();
  if (employmentStatusesCache && employmentStatusesCache.expiresAt > now) {
    return employmentStatusesCache.value;
  }

  try {
    const response = await fetchExternalApiJson(
      process.env.USER_MANAGEMENT_API_URL_EMPLOYMENT_STATUSES,
      process.env.USER_MANAGEMENT_DB_KEY
    );
    if (
      typeof response !== "object" ||
      response === null ||
      !("data" in response) ||
      !Array.isArray(response.data)
    ) {
      console.warn("[getAllEmploymentStatuses] employment API returned an invalid response.");
      return [];
    }

    const employmentStatuses = response.data.filter(isEmploymentStatus);
    employmentStatusesCache = {
      value: employmentStatuses,
      expiresAt: now + CACHE_TTL_MS,
    };
    return employmentStatuses;
  } catch {
    console.warn("[getAllEmploymentStatuses] employment API unavailable.");
    return [];
  }
};

export const getEmploymentStatusName = async (
  employmentStatusId: number
): Promise<string | null> => {
  const employmentStatuses = await getAllEmploymentStatuses();
  const employmentStatus = employmentStatuses.find(
    (status) => status.id === employmentStatusId
  )?.employmentStatus;

  return employmentStatus && employmentStatus.trim() !== ""
    ? employmentStatus
    : null;
};
