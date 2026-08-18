import "server-only";

import { getUserPermissions } from "@/server/permissions/getUserPermissions";

type ManagementPermission =
  | "canAccessManagement"
  | "canManageAuthorities"
  | "canManageDocuments"
  | "canManageDocumentCategories"
  | "canManageCalendars";

export class AuthorizationError extends Error {
  constructor() {
    super("この操作を行う権限がありません。");
    this.name = "AuthorizationError";
  }
}

const assertPermission = async (
  userId: number,
  permission: ManagementPermission
): Promise<void> => {
  const permissions = await getUserPermissions(userId);
  if (!permissions[permission]) {
    throw new AuthorizationError();
  }
};

export const assertCanAccessManagement = async (userId: number): Promise<void> =>
  assertPermission(userId, "canAccessManagement");

export const assertCanManageAuthorities = async (userId: number): Promise<void> =>
  assertPermission(userId, "canManageAuthorities");

export const assertCanManageDocuments = async (userId: number): Promise<void> =>
  assertPermission(userId, "canManageDocuments");

export const assertCanManageDocumentCategories = async (
  userId: number
): Promise<void> => assertPermission(userId, "canManageDocumentCategories");

export const assertCanManageCalendars = async (userId: number): Promise<void> =>
  assertPermission(userId, "canManageCalendars");
