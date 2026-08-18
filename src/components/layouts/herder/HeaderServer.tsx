import "server-only";
import HeaderClient from "./HeaderClient";
import { buildAppLinks, buildHeaderMenu, ConstList } from "./menu";
import { withAuth } from "@/lib/withAuth";

export default async function HeaderServer() {
  try {
    return await withAuth(async (ctx) => {
      const menuItems = buildHeaderMenu(ctx.user);
      const appLinks = buildAppLinks();
      return (
        <HeaderClient
          systemTitle={ConstList.SYS_TITLE}
          userId={ctx.user.userId}
          userName={ctx.user.familyName + ctx.user.givenName}
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
