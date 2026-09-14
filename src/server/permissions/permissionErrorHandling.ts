import "server-only";

import { AuthorizationError } from "@/server/permissions/assertPermissions";
import { PermissionResolutionError } from "@/server/permissions/getUserPermissions";

export type PermissionErrorKind = "authorization" | "resolution";

export const getPermissionErrorKind = (
  error: unknown
): PermissionErrorKind | null => {
  if (error instanceof AuthorizationError) {
    return "authorization";
  }

  if (error instanceof PermissionResolutionError) {
    return "resolution";
  }

  return null;
};

export const getPermissionActionErrorMessage = (
  error: unknown
): string | null => {
  const kind = getPermissionErrorKind(error);

  if (kind === "authorization") {
    return "この操作を実行する権限がありません。";
  }

  if (kind === "resolution") {
    return "権限情報を確認できませんでした。時間をおいて再度お試しください。";
  }

  return null;
};
