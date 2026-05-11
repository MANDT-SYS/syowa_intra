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
  } catch (e) {
    console.log('catch入った');
     // 未ログインは正常系。それ以外はサーバーログに残す
     const msg = e instanceof Error ? e.message : String(e);
     if (msg !== "UNAUTHORIZED") {
       console.error("[HeaderServer] render skipped:", e);
       console.log(e);
     }
    return null;
  }
}