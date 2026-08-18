"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/withAuth";
import { parseExternalUserId } from "@/lib/parseExternalUserId";
import { assertCanManageAuthorities } from "@/server/permissions/assertPermissions";
import { changeUserAuthority, AuthorityChangeError } from "@/server/authorities/write";
import { getAllUsers } from "@/server/users/getAllUsers";
import { ConstList } from "@/utils/ConstList";
import type { AssignableAuthorityLevel } from "@/types/authority";

export type ChangeAuthorityResult =
  | { success: true; message: string }
  | { success: false; error: string };

const isAssignableAuthorityLevel = (
  value: unknown
): value is AssignableAuthorityLevel =>
  value === "AUTHORIZED_USER" || value === "GENERAL";

const parseTargetUserId = (value: unknown): number => {
  const targetUserId = parseExternalUserId(value, "対象ユーザーID");

  if (targetUserId === ConstList.MASTER_AUTHORITY) {
    throw new AuthorityChangeError("開発者の権限は変更できません。");
  }

  return targetUserId;
};

const targetAuthorityLabel = (level: AssignableAuthorityLevel): string =>
  level === "AUTHORIZED_USER" ? "権限者" : "一般";

export const changeAuthorityAction = async (
  targetUserId: unknown,
  targetAuthorityLevel: unknown
): Promise<ChangeAuthorityResult> =>
  withAuth(async (ctx) => {
    try {
      const actorUserId = ctx.user.userId;
      await assertCanManageAuthorities(actorUserId);

      const safeTargetUserId = parseTargetUserId(targetUserId);
      if (!isAssignableAuthorityLevel(targetAuthorityLevel)) {
        throw new AuthorityChangeError("変更後の権限が不正です。");
      }
      if (safeTargetUserId === actorUserId) {
        throw new AuthorityChangeError("自分自身の権限は変更できません。");
      }

      const users = await getAllUsers();
      if (!users.some((user) => user.userId === safeTargetUserId)) {
        throw new AuthorityChangeError("対象のユーザーが見つかりません。");
      }

      await changeUserAuthority({
        actorUserId,
        targetUserId: safeTargetUserId,
        targetAuthorityLevel,
      });
      revalidatePath("/management/authorities");

      return {
        success: true,
        message: `権限を「${targetAuthorityLabel(targetAuthorityLevel)}」へ変更しました。`,
      };
    } catch (error) {
      if (error instanceof AuthorityChangeError) {
        return { success: false, error: error.message };
      }
      if (error instanceof Error && error.name === "AuthorizationError") {
        return { success: false, error: error.message };
      }

      console.error("[changeAuthorityAction] 権限変更に失敗しました。");
      return {
        success: false,
        error: "権限の変更に失敗しました。時間をおいて再度お試しください。",
      };
    }
  });
