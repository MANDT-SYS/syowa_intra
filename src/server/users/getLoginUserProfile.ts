import "server-only";

import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import { getEmploymentStatusName } from "@/server/employments/getAllEmploymentStatuses";
import type { UserPermissions } from "@/server/permissions/userPermissions";
import type { LoginUserProfile, UserInfo } from "@/types/interface";

const getDivisionNames = async (divisionId: number): Promise<string[]> => {
  try {
    const divisions = await getAllDivisions();
    const divisionName = divisions.find((division) => division.id === divisionId)
      ?.divisionName;

    return divisionName && divisionName.trim() !== "" ? [divisionName] : [];
  } catch {
    return [];
  }
};

/**
 * Headerで取得済みのユーザー・権限情報を基に、Clientへ渡す表示専用プロフィールを組み立てる。
 */
export const getLoginUserProfile = async (
  user: UserInfo,
  permissions: UserPermissions | null
): Promise<LoginUserProfile> => {
  const [divisionNames, employmentStatusName] = await Promise.all([
    getDivisionNames(user.divisionId),
    getEmploymentStatusName(user.employmentStatusId),
  ]);

  const email =
    typeof user.email === "string" && user.email.trim() !== ""
      ? user.email
      : null;

  return {
    userId: user.userId,
    userName: `${user.familyName}${user.givenName}`,
    email,
    divisionNames,
    authorityLabel: permissions?.authorityLabel ?? null,
    employmentStatusName,
  };
};
