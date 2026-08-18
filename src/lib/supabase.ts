// SupabaseのService Role Keyを使用するサーバー専用クライアント
import "server-only";
import { createClient } from "@supabase/supabase-js";

// DB・StorageともにService Role Keyでアクセスする。
// 強力な権限を持つため、Client Componentからは絶対にimportしない。
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
