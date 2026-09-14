import "server-only";
import HeaderClient from "./HeaderClient";
import { buildAppLinks, buildHeaderMenu } from "./menu";
import { withAuth } from "@/lib/withAuth";
import { ConstList } from "@/utils/ConstList";
import {
  getUserPermissions,
  PermissionResolutionError,
} from "@/server/permissions/getUserPermissions";
import { getLoginUserProfile } from "@/server/users/getLoginUserProfile";
import type { UserPermissions } from "@/server/permissions/userPermissions";

export default async function HeaderServer() {
  try {
    return await withAuth(async (ctx) => {
      let permissions: UserPermissions | null = null;
      try {
        permissions = await getUserPermissions(ctx.user.userId);
      } catch (error) {
        if (!(error instanceof PermissionResolutionError)) {
          throw error;
        }
        console.error("[HeaderServer] 権限情報を確認できませんでした。");
      }

      const profile = await getLoginUserProfile(ctx.user, permissions);
      const menuItems = buildHeaderMenu(
        permissions?.canAccessManagement ?? false
      );
      const appLinks = buildAppLinks();
      return (
        <HeaderClient
          systemTitle={ConstList.SYS_TITLE}
          profile={profile}
          menuItems={menuItems}
          appLinks={appLinks}
        />
      );
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return null;
    throw error;
  }
}
