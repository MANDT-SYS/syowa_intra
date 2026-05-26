// ============================================================
// 管理画面：データ取得（書類カテゴリ）
// - 一覧表で「カテゴリ名」と「件数（このカテゴリで登録されている書類数）」を取得
// ============================================================

import "server-only";
import { supabase } from "@/lib/supabase";
import type { DocumentCategory, DocumentCategoryWithCount } from "@/types/interface";

// ─────────────────────────────────────────────
// カテゴリ一覧（論理削除以外 + 各カテゴリの利用書類件数）
// ─────────────────────────────────────────────
export const getCategoriesWithCount = async (): Promise<DocumentCategoryWithCount[]> => {
  // 1. カテゴリ一覧（display_order昇順）
  const { data: cats, error: catErr } = await supabase
    .from("document_categories")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (catErr) {
    console.error("[getCategoriesWithCount] カテゴリ取得失敗:", catErr.message);
    return [];
  }

  const categories = (cats ?? []) as DocumentCategory[];

  // 2. 件数取得（documentsから category_id ごとに count）
  //    Supabaseの「group by + count」は head:true + count:'exact' を組み合わせるため、
  //    シンプルさ優先で生データを取って JS 側で集計する。
  const { data: docs, error: docErr } = await supabase
    .from("documents")
    .select("category_id")
    .is("deleted_at", null);

  if (docErr) {
    console.error("[getCategoriesWithCount] documents取得失敗:", docErr.message);
    // 件数は0扱いで返す
    return categories.map((c) => ({ ...c, document_count: 0 }));
  }

  // category_id ごとに件数を数える
  const countMap = new Map<number, number>();
  for (const row of (docs ?? []) as { category_id: number | null }[]) {
    if (!row.category_id) continue;
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  }

  return categories.map((c) => ({
    ...c,
    document_count: countMap.get(c.id) ?? 0,
  }));
};
