"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/withAuth";
import { parsePositiveSafeInteger } from "@/lib/parseId";
import { assertCanManageDocumentCategories } from "@/server/permissions/assertPermissions";
import { getPermissionActionErrorMessage } from "@/server/permissions/permissionErrorHandling";
import {
  insertCategory,
  removeCategory,
  setCategoryActive,
  updateCategory,
} from "@/app/management/server/write";
import type { DocumentCategory } from "@/types/interface";

const revalidateCategoryViews = () => {
  revalidatePath("/management");
  revalidatePath("/document");
};

export const addCategoryAction = async (name: string): Promise<DocumentCategory> =>
  withAuth(async (ctx) => {
    await assertCanManageDocumentCategories(ctx.user.userId);
    const inserted = await insertCategory(name, ctx);
    revalidateCategoryViews();
    return inserted;
  });

export const editCategoryAction = async (
  id: number,
  name: string
): Promise<DocumentCategory> =>
  withAuth(async (ctx) => {
    await assertCanManageDocumentCategories(ctx.user.userId);
    const safeId = parsePositiveSafeInteger(id, "カテゴリID");
    const updated = await updateCategory(safeId, name, ctx);
    revalidateCategoryViews();
    return updated;
  });

export const setCategoryActiveAction = async (
  id: number,
  activeFlag: boolean
): Promise<DocumentCategory> =>
  withAuth(async (ctx) => {
    await assertCanManageDocumentCategories(ctx.user.userId);
    const safeId = parsePositiveSafeInteger(id, "カテゴリID");
    if (typeof activeFlag !== "boolean") {
      throw new Error("カテゴリの状態が不正です。");
    }
    const updated = await setCategoryActive(safeId, activeFlag, ctx);
    revalidateCategoryViews();
    return updated;
  });

export type DeleteCategoryResult =
  | { success: true; deletedId: number }
  | { success: false; error: string };

export const removeCategoryAction = async (
  id: number
): Promise<DeleteCategoryResult> =>
  withAuth(async (ctx) => {
    try {
      await assertCanManageDocumentCategories(ctx.user.userId);
      const safeId = parsePositiveSafeInteger(id, "カテゴリID");
      await removeCategory(safeId, ctx);
      revalidateCategoryViews();
      return { success: true, deletedId: safeId };
    } catch (error) {
      const permissionErrorMessage = getPermissionActionErrorMessage(error);
      return {
        success: false,
        error:
          permissionErrorMessage ??
          (error instanceof Error ? error.message : "カテゴリの削除に失敗しました。"),
      };
    }
  });
