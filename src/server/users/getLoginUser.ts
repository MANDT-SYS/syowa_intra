import "server-only";
import { cache } from "react";
import { fetchExternalApiJson, ExternalApiError } from "@/server/externalApi";
import type { UserInfo } from "@/types/interface";

type ExternalUser = UserInfo & { authUserId: string };

const getUsersForRequest = cache(async (): Promise<ExternalUser[]> => {
  const response = await fetchExternalApiJson(process.env.USER_MANAGEMENT_API_URL, process.env.USER_MANAGEMENT_DB_KEY);
  if (typeof response !== "object" || response === null || !("data" in response) || !Array.isArray(response.data)) {
    throw new ExternalApiError("invalid_response");
  }
  return response.data as ExternalUser[];
});

export const getAllUsers = cache(async (): Promise<ExternalUser[]> => getUsersForRequest());

export const getLoginUser = cache(async (sub: string): Promise<ExternalUser | undefined> => {
  const users = await getUsersForRequest();
  return users.find((user) => user.authUserId === sub);
});
