import "server-only";
import { supabase } from "@/lib/supabase";
// 全ユーザー一覧取得（論理削除されていないもの）
export async function getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null);
  
    if (error) throw error;
    return data;
  }