import HeaderClient from "./HeaderClient";
import { buildAppLinks, buildHeaderMenu, ConstList } from "./menu";
import type { HeaderUserInfo } from "@/types/interface";
import { auth0 } from "@/lib/auth0";

export default async function HeaderServer() {
  //セッション情報を取得
  const session = await auth0.getSession();

  //セッションがない場合は何も表示しない
  if (!session?.user) {
    return null;
  }

  //ユーザー情報を取得
  const user: HeaderUserInfo = {
    //ユーザー名
    name: session.user.name ?? "",
    //権限ID
    authorityId: Number(session.user.user_metadata?.authority_id ?? 4),
    //雇用状態ID
    employmentStatusId: Number(session.user.user_metadata?.employment_status_id ?? 0),
    //部門ID
    divisionId: Number(session.user.user_metadata?.division_id ?? 0),
  };
  console.log(user);

  //メニュー項目を取得
  const menuItems = buildHeaderMenu(user);
  //アプリリンクを取得
  const appLinks = buildAppLinks();

  return (
    //ヘッダーを表示
    <HeaderClient
      //システムタイトル
      systemTitle={ConstList.SYS_TITLE}
      //デバッグローカル
      //debugLocal={ConstList.DEBUG_LOCAL}
      //ユーザー名
      userName={user.name}
      //メニュー項目
      menuItems={menuItems}
      //アプリリンク
      appLinks={appLinks}
    />
  );
}