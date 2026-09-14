import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documentCategories, documents } from "@/db/schema";
import { sanitizeText } from "@/lib/sanitize";
import type { AuthContext, DocumentCategory } from "@/types/interface";

const categoryColumns = {
  id: documentCategories.id,
  name: documentCategories.name,
  display_order: documentCategories.displayOrder,
  activeFlag: documentCategories.activeFlag,
  created_at: documentCategories.createdAt,
  created_by: documentCategories.createdBy,
  updated_at: documentCategories.updatedAt,
  updated_by: documentCategories.updatedBy,
  deleted_at: documentCategories.deletedAt,
  deleted_by: documentCategories.deletedBy,
};

const isPostgresError = (error: unknown, code: string): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === code;

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

  let result:
    | { kind: "inserted"; category: DocumentCategory }
    | { kind: "inactive" }
    | { kind: "duplicate" };

  try {
    result = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: documentCategories.id,
          activeFlag: documentCategories.activeFlag,
          deletedAt: documentCategories.deletedAt,
        })
        .from(documentCategories)
        .where(eq(documentCategories.name, sanitized))
        .limit(1)
        .for("update");

      if (existing) {
        return existing.deletedAt === null && !existing.activeFlag
          ? { kind: "inactive" as const }
          : { kind: "duplicate" as const };
      }

      const [maxRow] = await tx
        .select({ displayOrder: documentCategories.displayOrder })
        .from(documentCategories)
        .where(isNull(documentCategories.deletedAt))
        .orderBy(desc(documentCategories.displayOrder))
        .limit(1);

      const [inserted] = await tx
        .insert(documentCategories)
        .values({
          name: sanitized,
          displayOrder: (maxRow?.displayOrder ?? 0) + 1,
          createdAt: nowIso,
          createdBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .returning(categoryColumns);
      if (!inserted) throw new Error("カテゴリの登録結果を取得できませんでした。");
      return { kind: "inserted" as const, category: inserted };
    });
  } catch (error) {
    if (isPostgresError(error, "23505")) {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    console.error("[insertCategory] カテゴリ登録に失敗しました。");
    throw new Error("カテゴリの登録に失敗しました。");
  }

  if (result.kind === "inactive") {
    throw new Error("同名の使用停止カテゴリがあります。既存カテゴリを再有効化してください。");
  }
  if (result.kind === "duplicate") {
    throw new Error("同名のカテゴリが既に存在します。");
  }
  return result.category;
};

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
      .set({ name: sanitized, updatedAt: nowIso, updatedBy: userId })
      .where(and(eq(documentCategories.id, id), isNull(documentCategories.deletedAt)))
      .returning(categoryColumns);
    if (!updated) throw new Error("対象のカテゴリが見つかりません。");
    return updated;
  } catch (error) {
    if (isPostgresError(error, "23505")) {
      throw new Error("同名のカテゴリが既に存在します。");
    }
    if (error instanceof Error && error.message === "対象のカテゴリが見つかりません。") {
      throw error;
    }
    console.error("[updateCategory] カテゴリ更新に失敗しました。");
    throw new Error("カテゴリの更新に失敗しました。");
  }
};

export const setCategoryActive = async (
  id: number,
  activeFlag: boolean,
  ctx: AuthContext
): Promise<DocumentCategory> => {
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  try {
    const [updated] = await db
      .update(documentCategories)
      .set({ activeFlag, updatedAt: nowIso, updatedBy: userId })
      .where(and(eq(documentCategories.id, id), isNull(documentCategories.deletedAt)))
      .returning(categoryColumns);
    if (!updated) throw new Error("対象のカテゴリが見つかりません。");
    return updated;
  } catch (error) {
    if (error instanceof Error && error.message === "対象のカテゴリが見つかりません。") {
      throw error;
    }
    console.error("[setCategoryActive] カテゴリ状態の更新に失敗しました。");
    throw new Error("カテゴリの状態変更に失敗しました。");
  }
};

export const removeCategory = async (id: number, ctx: AuthContext): Promise<void> => {
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;
  let result: "removed" | "not_found" | "in_use";

  try {
    result = await db.transaction(async (tx) => {
      const [category] = await tx
        .select({ id: documentCategories.id })
        .from(documentCategories)
        .where(and(eq(documentCategories.id, id), isNull(documentCategories.deletedAt)))
        .limit(1)
        .for("update");
      if (!category) return "not_found" as const;

      const [usingDocument] = await tx
        .select({ id: documents.id })
        .from(documents)
        .where(and(eq(documents.categoryId, id), isNull(documents.deletedAt)))
        .limit(1);
      if (usingDocument) return "in_use" as const;

      await tx
        .update(documentCategories)
        .set({
          deletedAt: nowIso,
          deletedBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .where(and(eq(documentCategories.id, id), isNull(documentCategories.deletedAt)));
      return "removed" as const;
    });
  } catch {
    console.error("[removeCategory] カテゴリ削除に失敗しました。");
    throw new Error("カテゴリの削除に失敗しました。");
  }

  if (result === "not_found") {
    throw new Error("対象のカテゴリが見つかりません。");
  }
  if (result === "in_use") {
    throw new Error("このカテゴリは使用中の書類があるため削除できません。");
  }
};
