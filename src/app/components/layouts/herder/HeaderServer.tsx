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
          userId={ctx.user.user_id}
          userName={ctx.user.family_name + ctx.user.given_name}
          menuItems={menuItems}
          appLinks={appLinks}
        />
      );
    });
  } catch {
    return null;
  }
}