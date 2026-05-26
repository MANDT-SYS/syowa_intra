// ============================================================
// 管理画面：書類カテゴリの Server Actions
// - クライアント（カテゴリダイアログ）から呼ぶ
// ============================================================

"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/withAuth";
import {
  insertCategory,
  updateCategory,
  removeCategory,
} from "@/app/management/server/write";
import type { DocumentCategory } from "@/types/interface";

// ─────────────────────────────────────────────
// カテゴリ新規追加
// ─────────────────────────────────────────────
export const addCategoryAction = async (name: string): Promise<DocumentCategory> => {
  return withAuth(async (ctx) => {
    const inserted = await insertCategory(name, ctx);
    revalidatePath("/management");
    revalidatePath("/document"); // 一覧側のフィルタにも影響
    return inserted;
  });
};

// ─────────────────────────────────────────────
// カテゴリ編集
// ─────────────────────────────────────────────
export const editCategoryAction = async (
  id: number,
  name: string
): Promise<DocumentCategory> => {
  return withAuth(async (ctx) => {
    const updated = await updateCategory(id, name, ctx);
    revalidatePath("/management");
    revalidatePath("/document");
    return updated;
  });
};

// ─────────────────────────────────────────────
// カテゴリ削除
// ─────────────────────────────────────────────
export type DeleteCategoryResult =
  | { success: true; deletedId: number }
  | { success: false; error: string };

export const removeCategoryAction = async (
  id: number
): Promise<DeleteCategoryResult> => {
  return withAuth(async (ctx) => {
    try {
      await removeCategory(id, ctx);
      revalidatePath("/management");
      revalidatePath("/document");
      return { success: true, deletedId: id };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "削除に失敗しました。";
      return { success: false, error: msg };
    }
  });
};
