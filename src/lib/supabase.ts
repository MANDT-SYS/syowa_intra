//サーバー専用の裏口キー
import "server-only";
//これを使用して、データベースにアクセスする
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // SupabaseプロジェクトのURL
  //process.env.SUPABASE_SERVICE_ROLE_KEY!,  // サービスロールキー（強力な権限。危険なので絶対にフロントには渡さない）
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // 一般ユーザー用のキー
);
