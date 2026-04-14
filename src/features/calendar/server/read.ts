import "server-only";
import { supabase } from "@/lib/supabase";
import type { CalendarRecord, AuthContext } from "@/types/interface";

// カレンダー一覧を取得する関数
export const getCalendars = async (ctx: AuthContext): Promise<CalendarRecord[]> => {
  // Supabaseからcalendarテーブルの全件を年降順で取得
  const { data, error } = await supabase
    .from("calendar")
    .select("*")
    .order("year", { ascending: false });

  // エラーが発生した場合はエラーメッセージを表示して空配列を返す
  if (error) {
    console.error("カレンダー一覧取得失敗:", error.message);
    return [];
  }
  // データが存在しない場合も空配列を返す
  return data ?? [];
};
