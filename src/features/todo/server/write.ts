//server専用モジュール
import "server-only";//クライアントから使えないようにする安全装置
import { auth0 } from "@/lib/auth0";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Todo } from "@/types/interface";

//サーバーコンポーネント（page.tsx）からデータ取得または、Server Actionの両方から呼ばれる。

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★★データ追加★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
  export const insertTodo = async (title: string): Promise<Todo> => {
    const session = await auth0.getSession();
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    const trimmedTitle = title.trim();
  
    if (!trimmedTitle) {
      throw new Error("タイトルは必須です。");
    }
  
    const { data, error } = await supabaseAdmin
      .from("todo")
      .insert({
        title: trimmedTitle,
        // user_id: session.user.sub, // 必要なら保存
      })
      .select()
      .single();
    if (error) {
      console.error("追加失敗:", error.message);
      throw new Error("Todoの追加に失敗しました。");
    }

    if (!data) {
        throw new Error("追加後のTodo取得に失敗しました。");
      }

    return data;
  };
  
//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★★データ削除★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
  export const removeTodo = async (id: number): Promise<void> => {
    const session = await auth0.getSession();
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    const { error } = await supabaseAdmin
      .from("todo")
      .delete()
      .eq("id", id);
      // .eq("user_id", session.user.sub) // 必要なら本人データだけ削除
  
    if (error) {
      console.error("削除失敗:", error.message);
      throw new Error("Todoの削除に失敗しました。");
    }
  };