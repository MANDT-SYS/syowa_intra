// lib/withAuth.ts
import { auth0 } from "@/lib/auth0";
import { getLoginUser } from "@/server/getLoginUser";
import type { AuthContext, UserInfo } from "@/types/interface";
import { ConstList } from "@/utils/ConstList";

// ─────────────────────────────────────────
// 認証チェック
// 基本の認証ラッパー
// 全処理の入口。セッション確認 → ユーザー取得 をまとめる
// ─────────────────────────────────────────
export async function withAuth<T>(
  handler: (ctx: AuthContext) => Promise<T>
): Promise<T> {
  // ① Auth0セッション確認
  const session = await auth0.getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED"); // 未ログイン
  }

  // ② usersテーブルからユーザー情報取得
  const loginUserArr = await getLoginUser(session.user.sub);
  if (!loginUserArr || loginUserArr.length === 0) {
    throw new Error("UNAUTHORIZED"); // アプリ未登録ユーザー
  }

  const user: UserInfo = loginUserArr[0];
  
  // ③ ハンドラーにユーザー情報を渡して実行
  return handler({ sub: session.user.sub, user });
}

// ─────────────────────────────────────────
// 認証＋権限チェック
// 権限チェック付きラッパー
// 指定したrole_idを「持っていない」ユーザーのみ通す
// ─────────────────────────────────────────
export async function withRole<T>(
  // 「この権限IDは禁止」という配列で渡す
  deniedRoleIds: number[],
  handler: (ctx: AuthContext) => Promise<T>
): Promise<T> {
  
//認証チェック
  return withAuth(async (ctx) => {
    // ④ 権限チェック：禁止リストに含まれていたらエラー
    if (deniedRoleIds.includes(Number(ctx.user.accountancy_authority_id))) {
      throw new Error("権限がありません。"); // 権限なし
    }
    return handler(ctx);
    // エラーではなくnullや特別な値を返して、画面のみで表示
    //return null as T;
  });
}
