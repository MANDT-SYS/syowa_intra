// src/app/management/server/write.ts
// ============================================================
// 管理画面：書類カテゴリ CRUD（DB操作）
// - 必ず Server Action 経由（withAuth で認証済み）から呼び出す
// ============================================================

import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documentCategories } from "@/db/schema";
import { sanitizeText } from "@/lib/sanitize";
import type { AuthContext, DocumentCategory } from "@/types/interface";

const categoryColumns = {
  id: documentCategories.id,
  name: documentCategories.name,
  display_order: documentCategories.displayOrder,
  created_at: documentCategories.createdAt,
  created_by: documentCategories.createdBy,
  updated_at: documentCategories.updatedAt,
  updated_by: documentCategories.updatedBy,
  deleted_at: documentCategories.deletedAt,
  deleted_by: documentCategories.deletedBy,
};

const isPostgresError = (error: unknown, code: string): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
};

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

  try {
    const category = await db.transaction(async (tx) => {
      const [maxRow] = await tx
        .select({ display_order: documentCategories.displayOrder })
        .from(documentCategories)
        .where(isNull(documentCategories.deletedAt))
        .orderBy(desc(documentCategories.displayOrder))
        .limit(1);

      const [inserted] = await tx
        .insert(documentCategories)
        .values({
          name: sanitized,
          displayOrder: (maxRow?.display_order ?? 0) + 1,
          createdAt: nowIso,
          createdBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .returning(categoryColumns);

      if (!inserted) {
        throw new Error("カテゴリの追加に失敗しました。");
      }
      return inserted;
    });

    return category;
  } catch (error) {
    if (isPostgresError(error, "23505")) {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    console.error("[insertCategory] DB追加に失敗しました。");
    throw new Error("カテゴリの追加に失敗しました。");
  }
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

  try {
    const [updated] = await db
      .update(documentCategories)
      .set({
        name: sanitized,
        updatedAt: nowIso,
        updatedBy: userId,
      })
      .where(eq(documentCategories.id, id))
      .returning(categoryColumns);

    if (!updated) {
      throw new Error("カテゴリの更新に失敗しました。");
    }
    return updated;
  } catch (error) {
    if (isPostgresError(error, "23505")) {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    console.error("[updateCategory] DB更新に失敗しました。");
    throw new Error("カテゴリの更新に失敗しました。");
  }
};

// ─────────────────────────────────────────────
// 削除（論理削除）
// - 関連する documents 側は ON DELETE SET NULL ではなく、カテゴリ論理削除のため
//   そのまま category_id を保持する。表示時に「カテゴリ無し」扱いになる。
// ─────────────────────────────────────────────
export const removeCategory = async (id: number, ctx: AuthContext): Promise<void> => {
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  try {
    const [removed] = await db
      .update(documentCategories)
      .set({
        deletedAt: nowIso,
        deletedBy: userId,
        updatedAt: nowIso,
        updatedBy: userId,
      })
      .where(and(eq(documentCategories.id, id), isNull(documentCategories.deletedAt)))
      .returning({ id: documentCategories.id });
    if (!removed) throw new Error("対象のカテゴリが見つかりません。");
  } catch {
    console.error("[removeCategory] DB削除に失敗しました。");
    throw new Error("カテゴリの削除に失敗しました。");
  }
};
