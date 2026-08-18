import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { authorityMaster, authorityUser } from "@/db/schema";
import { AUTHORIZED_USER_AUTHORITY_CODE } from "@/server/permissions/userPermissions";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import { getAllUsers } from "@/server/users/getAllUsers";
import type { AuthorityUserListItem } from "@/types/authority";
import { ConstList } from "@/utils/ConstList";

/**
 * 指定ユーザーに、有効な AUTHORIZED_USER 権限の割当があるかを確認する。
 * DEVELOPER 判定は呼び出し元で先に完結するため、この関数では扱わない。
 */
export const hasActiveAuthorizedUserRole = async (
  userId: number
): Promise<boolean> => {
  const [assignment] = await db
    .select({ authorityUserId: authorityUser.authorityUserId })
    .from(authorityUser)
    .innerJoin(
      authorityMaster,
      eq(authorityUser.authorityId, authorityMaster.authorityId)
    )
    .where(
      and(
        eq(authorityUser.userId, userId),
        isNull(authorityUser.deletedAt),
        isNull(authorityMaster.deletedAt),
        eq(authorityMaster.authorityCode, AUTHORIZED_USER_AUTHORITY_CODE)
      )
    )
    .limit(1);

  return assignment !== undefined;
};

const getActiveAuthorizedUserIds = async (): Promise<Set<number>> => {
  const assignments = await db
    .select({ userId: authorityUser.userId })
    .from(authorityUser)
    .innerJoin(
      authorityMaster,
      eq(authorityUser.authorityId, authorityMaster.authorityId)
    )
    .where(
      and(
        isNull(authorityUser.deletedAt),
        isNull(authorityMaster.deletedAt),
        eq(authorityMaster.authorityCode, AUTHORIZED_USER_AUTHORITY_CODE)
      )
    );

  return new Set(assignments.map((assignment) => assignment.userId));
};

/**
 * 外部ユーザー・部署マスタと有効なAUTHORI​ZED_USER割当を一度ずつ取得して、
 * 権限設定画面用の一覧へ整形する。ユーザー単位のDB照会は行わない。
 */
export const getAuthorityUserList = async (): Promise<AuthorityUserListItem[]> => {
  const [users, divisions] = await Promise.all([getAllUsers(), getAllDivisions()]);

  let authorizedUserIds: Set<number>;
  try {
    authorizedUserIds = await getActiveAuthorizedUserIds();
  } catch {
    console.error("[getAuthorityUserList] 権限情報の取得に失敗しました。");
    throw new Error("権限情報を取得できませんでした。時間をおいて再度お試しください。");
  }

  const divisionNameById = new Map(
    divisions.map((division) => [division.id, division.divisionName])
  );

  return users
    .map((user): AuthorityUserListItem => ({
      userId: user.userId,
      userName: `${user.familyName} ${user.givenName}`.trim(),
      divisionName: divisionNameById.get(user.divisionId) ?? null,
      authorityLevel:
        user.userId === ConstList.MASTER_AUTHORITY
          ? "DEVELOPER"
          : authorizedUserIds.has(user.userId)
            ? "AUTHORIZED_USER"
            : "GENERAL",
    }))
    .sort((left, right) => left.userId - right.userId);
};
