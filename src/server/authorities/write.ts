import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { authorityMaster, authorityUser } from "@/db/schema";
import { AUTHORIZED_USER_AUTHORITY_CODE } from "@/server/permissions/userPermissions";

export type AuthorityChangeTarget = "AUTHORIZED_USER" | "GENERAL";

export class AuthorityChangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorityChangeError";
  }
}

const isPostgresError = (error: unknown, code: string): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === code;

const findActiveAuthorizedUserAssignment = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  targetUserId: number
) => {
  const [assignment] = await tx
    .select({ authorityUserId: authorityUser.authorityUserId })
    .from(authorityUser)
    .innerJoin(
      authorityMaster,
      eq(authorityUser.authorityId, authorityMaster.authorityId)
    )
    .where(
      and(
        eq(authorityUser.userId, targetUserId),
        isNull(authorityUser.deletedAt),
        isNull(authorityMaster.deletedAt),
        eq(authorityMaster.authorityCode, AUTHORIZED_USER_AUTHORITY_CODE)
      )
    )
    .limit(1);

  return assignment;
};

const grantAuthorizedUser = async (
  actorUserId: number,
  targetUserId: number
): Promise<void> => {
  const now = new Date().toISOString();

  try {
    await db.transaction(async (tx) => {
      const [authority] = await tx
        .select({ authorityId: authorityMaster.authorityId })
        .from(authorityMaster)
        .where(
          and(
            isNull(authorityMaster.deletedAt),
            eq(authorityMaster.authorityCode, AUTHORIZED_USER_AUTHORITY_CODE)
          )
        )
        .limit(1);

      if (!authority) {
        throw new AuthorityChangeError("権限マスターが見つかりません。");
      }

      const existing = await findActiveAuthorizedUserAssignment(tx, targetUserId);
      if (existing) {
        throw new AuthorityChangeError("対象のユーザーはすでに権限者です。");
      }

      await tx.insert(authorityUser).values({
        authorityId: authority.authorityId,
        userId: targetUserId,
        createdAt: now,
        createdBy: actorUserId,
        updatedAt: now,
        updatedBy: actorUserId,
      });
    });
  } catch (error) {
    if (error instanceof AuthorityChangeError) throw error;
    if (isPostgresError(error, "23505")) {
      throw new AuthorityChangeError("対象のユーザーはすでに権限者です。");
    }
    console.error("[grantAuthorizedUser] 権限付与に失敗しました。");
    throw new AuthorityChangeError("権限の変更に失敗しました。時間をおいて再度お試しください。");
  }
};

const revokeAuthorizedUser = async (
  actorUserId: number,
  targetUserId: number
): Promise<void> => {
  const now = new Date().toISOString();

  try {
    await db.transaction(async (tx) => {
      const assignment = await findActiveAuthorizedUserAssignment(tx, targetUserId);
      if (!assignment) {
        throw new AuthorityChangeError("対象のユーザーはすでに一般です。");
      }

      const [updated] = await tx
        .update(authorityUser)
        .set({
          deletedAt: now,
          deletedBy: actorUserId,
          updatedAt: now,
          updatedBy: actorUserId,
        })
        .where(
          and(
            eq(authorityUser.authorityUserId, assignment.authorityUserId),
            isNull(authorityUser.deletedAt)
          )
        )
        .returning({ authorityUserId: authorityUser.authorityUserId });

      if (!updated) {
        throw new AuthorityChangeError("対象のユーザーはすでに一般です。");
      }
    });
  } catch (error) {
    if (error instanceof AuthorityChangeError) throw error;
    console.error("[revokeAuthorizedUser] 権限解除に失敗しました。");
    throw new AuthorityChangeError("権限の変更に失敗しました。時間をおいて再度お試しください。");
  }
};

export const changeUserAuthority = async ({
  actorUserId,
  targetUserId,
  targetAuthorityLevel,
}: {
  actorUserId: number;
  targetUserId: number;
  targetAuthorityLevel: AuthorityChangeTarget;
}): Promise<void> => {
  if (targetAuthorityLevel === "AUTHORIZED_USER") {
    return grantAuthorizedUser(actorUserId, targetUserId);
  }

  return revokeAuthorizedUser(actorUserId, targetUserId);
};
