//server専用モジュール
import "server-only";//クライアントから使えないようにする安全装置
import { auth0 } from "@/lib/auth0";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Todo } from "@/types/interface";

//サーバーコンポーネント（page.tsx）からデータ取得または、Server Actionの両方から呼ばれる。

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★★データ取得★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
export const getTodos = async (): Promise<Todo[]> => {
    const session = await auth0.getSession();// セッション情報を取得
    
    //ユーザーが認証されていない場合は空配列を返す。
    if (!session?.user) {
      return [];
    }
    //データ取得
    const { data, error } = await supabaseAdmin
      .from("todo")
      .select("*")
      //.eq("user_id", session.user.id) // 例: ログインユーザーのデータだけ取得したい場合
      .order("id", { ascending: true });
  
    //データ取得に失敗したらエラーを返す。
    if (error) {
      console.error("一覧取得失敗:", error.message);
      return [];
    }
    
    return data ?? [];//データ取得に成功したらdataを返す。
  }