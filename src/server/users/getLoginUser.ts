import "server-only";
//import { supabase } from "@/lib/supabase";
// ログインユーザー一覧取得（論理削除されていないもの）
export async function getLoginUser(sub: string) {
   
  const apiUrl = process.env.USER_MANAGEMENT_API_URL;
  const apiKey = process.env.USER_MANAGEMENT_DB_KEY;

  if (!apiUrl || !apiKey) {
    console.warn("[withAuth] USER_MANAGEMENT_API_URL/KEY 未設定のためスキップ");
  } 
  else {
    try {
      //APIURLをenvに書いてユーザー情報をフェッチで取得。
      // ユーザー取得API
      const res = await fetch(`${apiUrl}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // APIキー
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      });

      //API取得に失敗した場合
      if (!res.ok) {
        throw new Error("ユーザー一覧APIの取得に失敗しました");
      }
      const users = await res.json();

      //ユーザーデータが見つからない場合
      if (!users.data || !Array.isArray(users.data)) {
        throw new Error("ユーザーが見つかりませんでした。");
      }

      // subとauthUserIdが一致するもの(ログインユーザー)だけを抽出
      const filteredUsers = users.data.filter(
        (user: { authUserId: string }) => user.authUserId === sub
      );

      //ログインユーザーが見つからない場合
      if (filteredUsers.length === 0) {
        throw new Error("該当するユーザーが見つかりませんでした。");
      }

      return filteredUsers[0];

    } catch (e) {
      //例外処理
      console.warn("[withAuth] user mgmt API failed:", e);
      throw e;
    }
  }
  //supabaseからユーザー情報を取得する場合
   // const { data, error } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('auth_user_id', sub)
    //   .is('deleted_at', null);
  
    // if (error) throw error;
    // return data;
}

  //トークンはxamppのAuth0のconstに入ってる。
  // const EXTERNAL_DB_KEY = '1|lfpN6pdVW7Wl4QVyLaJs2CUqxsrCqRJLyvuWU1M5ecf58bb9';←今回はこれ
  // const EXTERNAL_SUBCONTRACTING_COST_DB_KEY = '1|us9fVulAqOVm6x8HFDUVjpwaNIHzIF7zC771RzyW54a77db3';
  // const EXTERNAL_CUSTOMER_DB_KEY = '1|TF7YKfV6XUIcRmdPVOm8Ew3id2ZM3IkNACGNYjfk858060c4';
  // const ATTENDANCE_KEY = '3|nbypfuFUOxP9juJHZI8JM35vXOrxsyYdaeifVdoQ';
  //+