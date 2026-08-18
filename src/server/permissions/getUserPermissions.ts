import "server-only";

import { cache } from "react";
import { hasActiveAuthorizedUserRole } from "@/server/authorities/read";
import { withAuth } from "@/lib/withAuth";
import { ConstList } from "@/utils/ConstList";
import {
  createUserPermissions,
  type UserPermissions,
} from "@/server/permissions/userPermissions";

export class PermissionResolutionError extends Error {
  constructor() {
    super("権限情報を取得できませんでした。時間をおいて再度お試しください。");
    this.name = "PermissionResolutionError";
  }
}

const resolveUserPermissions = cache(
  async (userId: number): Promise<UserPermissions> => {
    if (userId === ConstList.MASTER_AUTHORITY) {
      return createUserPermissions(userId, "DEVELOPER");
    }

    try {
      const hasAuthorizedUserRole = await hasActiveAuthorizedUserRole(userId);
      return createUserPermissions(
        userId,
        hasAuthorizedUserRole ? "AUTHORIZED_USER" : "GENERAL"
      );
    } catch {
      console.error("[getUserPermissions] 権限情報の取得に失敗しました。");
      throw new PermissionResolutionError();
    }
  }
);

/**
 * withAuth 済みのユーザーIDから権限を解決する。
 * React cache に渡す引数は number のみとし、同一サーバーリクエスト内の照会を共有する。
 */
export const getUserPermissions = async (
  userId: number
): Promise<UserPermissions> => resolveUserPermissions(userId);

/** 現在のログインユーザーを解決してから権限を取得する入口。 */
export const getCurrentUserPermissions = async (): Promise<UserPermissions> =>
  withAuth(async (ctx) => getUserPermissions(ctx.user.userId));
