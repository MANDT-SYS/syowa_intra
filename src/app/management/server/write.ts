// ============================================================
// 管理画面：書類カテゴリ CRUD（DB操作）
// - 必ず Server Action 経由（withAuth で認証済み）から呼び出す
// ============================================================

import "server-only";
import { supabase } from "@/lib/supabase";
import { sanitizeText } from "@/lib/sanitize";
import type { AuthContext, DocumentCategory } from "@/types/interface";

// ─────────────────────────────────────────────
// 新規追加
// ─────────────────────────────────────────────
export const insertCategory = async (
  name: string,
  ctx: AuthContext
): Promise<DocumentCategory> => {
  const sanitized = sanitizeText(name, {
    maxLength: 100,
    fieldName: "カテゴリ名",
  });

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  // 末尾のdisplay_orderを採用するため、現在の最大値を取得
  const { data: maxRow } = await supabase
    .from("document_categories")
    .select("display_order")
    .is("deleted_at", null)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("document_categories")
    .insert({
      name: sanitized,
      display_order: nextOrder,
      created_at: nowIso,
      created_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .select()
    .single();

  if (error || !data) {
    // ユニーク制約違反などの場合はメッセージを判定
    if (error?.message?.includes("duplicate") || error?.code === "23505") {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    console.error("[insertCategory] 追加失敗:", error?.message);
    throw new Error("カテゴリの追加に失敗しました。");
  }

  return data as DocumentCategory;
};

// ─────────────────────────────────────────────
// 編集
// ─────────────────────────────────────────────
export const updateCategory = async (
  id: number,
  name: string,
  ctx: AuthContext
): Promise<DocumentCategory> => {
  const sanitized = sanitizeText(name, {
    maxLength: 100,
    fieldName: "カテゴリ名",
  });

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  const { data, error } = await supabase
    .from("document_categories")
    .update({
      name: sanitized,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    if (error?.message?.includes("duplicate") || error?.code === "23505") {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    console.error("[updateCategory] 更新失敗:", error?.message);
    throw new Error("カテゴリの更新に失敗しました。");
  }

  return data as DocumentCategory;
};

// ─────────────────────────────────────────────
// 削除（論理削除）
// - 関連する documents 側は ON DELETE SET NULL ではなく、カテゴリ論理削除のため
//   そのまま category_id を保持する。表示時に「カテゴリ無し」扱いになる。
// ─────────────────────────────────────────────
export const removeCategory = async (id: number, ctx: AuthContext): Promise<void> => {
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  const { error } = await supabase
    .from("document_categories")
    .update({
      deleted_at: nowIso,
      deleted_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) {
    console.error("[removeCategory] 削除失敗:", error.message);
    throw new Error("カテゴリの削除に失敗しました。");
  }
};
