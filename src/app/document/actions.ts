// src/app/document/actions.ts
// ============================================================
// 書類管理：Server Actions
// - クライアントコンポーネント（ダイアログ等）から呼ばれる入口。
// - 認証は必ず withAuth を通す（プロジェクトルール）。
// - 受け取った FormData をパースして、server/write.ts の関数へ橋渡しする。
// ============================================================

"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/withAuth";
import { parsePositiveSafeInteger } from "@/lib/parseId";
import { assertFileSize } from "@/lib/fileSize";
import {
  insertDocument,
  updateDocument,
  reviseDocument,
  removeDocument,
} from "@/app/document/server/write";

// FormDataから安全に文字列を取り出す共通ヘルパ
const formString = (fd: FormData, key: string, fallback = ""): string => {
  const v = fd.get(key);
  return typeof v === "string" ? v : fallback;
};

// FormDataから number を安全に取り出すヘルパ
const formNumber = (fd: FormData, key: string, fallback = 0): number => {
  const v = fd.get(key);
  if (typeof v !== "string" || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// FormDataから任意ID（未選択は null）を取り出すヘルパ
const formOptionalId = (fd: FormData, key: string): number | null => {
  const value = fd.get(key);
  if (typeof value !== "string" || value === "") return null;
  return parsePositiveSafeInteger(value, key);
};

// FormDataから必須IDを取り出すヘルパ
const formRequiredId = (fd: FormData, key: string): number => {
  const value = fd.get(key);
  if (typeof value !== "string") throw new Error(`${key}が不正です。`);
  return parsePositiveSafeInteger(value, key);
};

// ─────────────────────────────────────────────
// ③ 新規登録
// ─────────────────────────────────────────────
export const addDocumentAction = async (formData: FormData): Promise<{ id: number }> => {
  return withAuth(async (ctx) => {
    const title = formString(formData, "title");
    const managementNumber = formString(formData, "managementNumber");
    const description = formString(formData, "description");
    const categoryId = formOptionalId(formData, "categoryId");
    const managementDivisionId = formRequiredId(formData, "managementDivisionId");
    const managedFromRevisionNumber = formNumber(formData, "managedFromRevisionNumber", 1);
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      throw new Error("ファイルを選択してください。");
    }

    assertFileSize(file);

    const inserted = await insertDocument({
      title,
      managementNumber,
      description: description || null,
      categoryId,
      managementDivisionId,
      managedFromRevisionNumber,
      file,
      ctx,
    });

    // 一覧・詳細のキャッシュを最新化
    revalidatePath("/document");
    return { id: inserted.id };
  });
};

// ─────────────────────────────────────────────
// ④ 編集（メタ情報修正・ファイル差し替え）
// ─────────────────────────────────────────────
export const editDocumentAction = async (formData: FormData): Promise<{ id: number }> => {
  return withAuth(async (ctx) => {
    const documentId = formRequiredId(formData, "documentId");

    const title = formString(formData, "title");
    const managementNumber = formString(formData, "managementNumber");
    const description = formString(formData, "description");
    const categoryId = formOptionalId(formData, "categoryId");
    const managementDivisionId = formRequiredId(formData, "managementDivisionId");
    const managedFromRevisionNumber = formNumber(formData, "managedFromRevisionNumber", 1);
    const fileRaw = formData.get("file") as File | null;
    // size=0 のときは「差し替え無し」とみなす
    const newFile = fileRaw && fileRaw.size > 0 ? fileRaw : null;
    if (newFile) assertFileSize(newFile);

    await updateDocument({
      documentId,
      title,
      managementNumber,
      description: description || null,
      categoryId,
      managementDivisionId,
      managedFromRevisionNumber,
      newFile,
      ctx,
    });

    revalidatePath("/document");
    revalidatePath(`/document/${documentId}`);
    return { id: documentId };
  });
};

// ─────────────────────────────────────────────
// ⑤ 改版
// ─────────────────────────────────────────────
export const reviseDocumentAction = async (formData: FormData): Promise<{ id: number }> => {
  return withAuth(async (ctx) => {
    const documentId = formRequiredId(formData, "documentId");

    const title = formString(formData, "title");
    const managementNumber = formString(formData, "managementNumber");
    const description = formString(formData, "description");
    const categoryId = formOptionalId(formData, "categoryId");
    const managementDivisionId = formRequiredId(formData, "managementDivisionId");
    const managedFromRevisionNumber = formNumber(formData, "managedFromRevisionNumber", 1);
    const notes = formString(formData, "notes");
    const fileRaw = formData.get("file") as File | null;
    const newFile = fileRaw && fileRaw.size > 0 ? fileRaw : null;
    if (newFile) assertFileSize(newFile);

    await reviseDocument({
      documentId,
      title,
      managementNumber,
      description: description || null,
      categoryId,
      managementDivisionId,
      managedFromRevisionNumber,
      notes: notes || null,
      newFile,
      ctx,
    });

    revalidatePath("/document");
    revalidatePath(`/document/${documentId}`);
    return { id: documentId };
  });
};

// ─────────────────────────────────────────────
// 削除（論理削除）
// ─────────────────────────────────────────────
export type DeleteDocumentResult =
  | { success: true; deletedId: number }
  | { success: false; error: string };

export const removeDocumentAction = async (
  documentId: number
): Promise<DeleteDocumentResult> => {
  const safeDocumentId = parsePositiveSafeInteger(documentId, "documentId");
  return withAuth<DeleteDocumentResult>(async (ctx) => {
    try {
      await removeDocument({ documentId: safeDocumentId, ctx });
      revalidatePath("/document");
      return { success: true, deletedId: safeDocumentId };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "削除に失敗しました。";
      return { success: false, error: msg };
    }
  });
};
