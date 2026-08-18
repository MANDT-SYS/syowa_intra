// src/app/management/server/read.ts
// ============================================================
// 管理画面：データ取得（書類カテゴリ）
// - 一覧表で「カテゴリ名」と「件数（このカテゴリで登録されている書類数）」を取得
// ============================================================

import "server-only";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documentCategories, documents } from "@/db/schema";
import type { DocumentCategory, DocumentCategoryWithCount } from "@/types/interface";

// ─────────────────────────────────────────────
// カテゴリ一覧（論理削除以外 + 各カテゴリの利用書類件数）
// ─────────────────────────────────────────────
export const getCategoriesWithCount = async (): Promise<DocumentCategoryWithCount[]> => {
  let categories: DocumentCategory[];
  try {
    categories = await db
      .select({
        id: documentCategories.id,
        name: documentCategories.name,
        display_order: documentCategories.displayOrder,
        created_at: documentCategories.createdAt,
        created_by: documentCategories.createdBy,
        updated_at: documentCategories.updatedAt,
        updated_by: documentCategories.updatedBy,
        deleted_at: documentCategories.deletedAt,
        deleted_by: documentCategories.deletedBy,
      })
      .from(documentCategories)
      .where(isNull(documentCategories.deletedAt))
      .orderBy(asc(documentCategories.displayOrder));
  } catch (error) {
    console.error(
      "[getCategoriesWithCount] カテゴリ取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return [];
  }

  let documentRows;
  try {
    documentRows = await db
      .select({ category_id: documents.categoryId })
      .from(documents)
      .where(isNull(documents.deletedAt));
  } catch (error) {
    console.error(
      "[getCategoriesWithCount] documents取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return categories.map((c) => ({ ...c, document_count: 0 }));
  }

  const countMap = new Map<number, number>();
  for (const row of documentRows) {
    if (!row.category_id) continue;
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  }

  return categories.map((c) => ({
    ...c,
    document_count: countMap.get(c.id) ?? 0,
  }));
};
