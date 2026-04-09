//server専用モジュール
import "server-only";//クライアントから使えないようにする安全装置
import { auth0 } from "@/lib/auth0";
import { supabase } from "@/lib/supabase";
import type { AuthContext, Todo } from "@/types/interface";
import { sanitizeText } from '@/lib/sanitize';

//サーバーコンポーネント（page.tsx）からデータ取得または、Server Actionの両方から呼ばれる。

//★★★★★★★★★★★★★★★★★★★★★★
//★★★★★★★★データ登録処理★★★★★★★
//★★★★★★★★★★★★★★★★★★★★★★
  export const insertTodo = async (title: string, ctx: AuthContext): Promise<Todo> => {
  
    //タイトルをサニタイズ
    const sanitizedTitle = sanitizeText(title, {
      maxLength: 100,
      fieldName: "タイトル",
    });
  
    const { data, error } = await supabase
      .from("todo")
      .insert({
        title: sanitizedTitle,
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
  
//★★★★★★★★★★★★★★★★★★★★★★
//★★★★★★★★データ削除処理★★★★★★★
//★★★★★★★★★★★★★★★★★★★★★★
  export const removeTodo = async (id: number, ctx: AuthContext): Promise<void> => {

    const { error } = await supabase
      .from("todo")
      .delete()
      .eq("id", id);
      // .eq("user_id", session.user.sub) // 必要なら本人データだけ削除
  
    if (error) {
      console.error("削除失敗:", error.message);
      throw new Error("Todoの削除に失敗しました。");
    }
  };