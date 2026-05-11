import "server-only";
//import { supabase } from "@/lib/supabase";
// 全ユーザー一覧取得（論理削除されていないもの）
export async function getAllUsers() {
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

      if (!res.ok) {
        throw new Error("ユーザー一覧APIの取得に失敗しました");
      }
      const users = await res.json();

      if (!users.data || !Array.isArray(users.data)) {
        throw new Error("ユーザーが見つかりませんでした。");
      }

      return users.data;

    } catch (e) {
      console.warn("[withAuth] user mgmt API failed:", e);
      throw e;
    }
  }
  //supabaseからユーザー情報を取得する場合
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('*')
    //   .is('deleted_at', null);
  
    // if (error) throw error;
    // return data;
  }