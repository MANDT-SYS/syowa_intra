import "server-only";
//import { supabase } from "@/lib/supabase";
// 全部署一覧取得（論理削除されていないもの）
export async function getAllDivisions() {
  const apiUrl = process.env.USER_MANAGEMENT_API_URL_DIVISIONS;
  const apiKey = process.env.USER_MANAGEMENT_DB_KEY;
  
  if (!apiUrl || !apiKey) {
    console.warn("[withAuth] USER_MANAGEMENT_API_URL_DIVISIONS/KEY 未設定のためスキップ");
  } 
  else {
    try {
      //APIURLをenvに書いて部署情報をフェッチで取得。
      // 部署取得API
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
        throw new Error("部署一覧APIの取得に失敗しました");
      }
      const divisions = await res.json();

      if (!divisions.data || !Array.isArray(divisions.data)) {
        throw new Error("部署データが見つかりませんでした。");
      }

      return divisions.data;

    } catch (e) {
      console.warn("[withAuth] user mgmt API failed:", e);
      throw e;
    }
  }
}