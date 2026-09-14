// 権限レベルから画面・操作ごとの許可を導出する純粋なロジック。
// DBや認証基盤に依存させず、権限仕様をここへ集約する。

import type { UserAuthorityLevel } from "@/types/authority";

export const AUTHORIZED_USER_AUTHORITY_CODE = "AUTHORIZED_USER";

export type { UserAuthorityLevel } from "@/types/authority";

export type UserPermissions = {
  userId: number;
  authorityLevel: UserAuthorityLevel;
  /** プロフィール等で表示する権限名。AUTHORIZED_USERはauthority_masterを正本とする。 */
  authorityLabel: string | null;

  isDeveloper: boolean;
  /** authority_user / authority_master による AUTHORIZED_USER の割当を持つか。DEVELOPER は含まない。 */
  hasAuthorizedUserRole: boolean;

  canAccessManagement: boolean;
  canManageAuthorities: boolean;

  canManageDocuments: boolean;
  canManageDocumentCategories: boolean;
  canManageCalendars: boolean;
};

export const createUserPermissions = (
  userId: number,
  authorityLevel: UserAuthorityLevel,
  authorizedUserAuthorityName?: string
): UserPermissions => {
  const isDeveloper = authorityLevel === "DEVELOPER";
  const hasAuthorizedUserRole = authorityLevel === "AUTHORIZED_USER";
  const canManageBusinessContent = isDeveloper || hasAuthorizedUserRole;

  return {
    userId,
    authorityLevel,
    authorityLabel:
      authorityLevel === "DEVELOPER"
        ? "開発者"
        : authorityLevel === "GENERAL"
          ? "一般"
          : authorizedUserAuthorityName?.trim() || null,
    isDeveloper,
    hasAuthorizedUserRole,
    canAccessManagement: canManageBusinessContent,
    canManageAuthorities: canManageBusinessContent,
    canManageDocuments: canManageBusinessContent,
    canManageDocumentCategories: canManageBusinessContent,
    canManageCalendars: canManageBusinessContent,
  };
};
