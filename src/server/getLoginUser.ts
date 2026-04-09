import "server-only";
import { supabase } from "@/lib/supabase";
// ユーザー一覧取得（論理削除されていないもの）
export async function getLoginUser(sub: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', sub)
      .is('deleted_at', null);
  
    if (error) throw error;
    return data;
  }