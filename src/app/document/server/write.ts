// src/app/document/server/write.ts
import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, revisions } from "@/db/schema";
import { sanitizeText } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase";
import { assertFileSize } from "@/lib/fileSize";
import type {
  AuthContext,
  DocumentFileType,
  DocumentRecord,
  RevisionRecord,
} from "@/types/interface";

const BUCKET = "documents";

const documentColumns = {
  id: documents.id,
  title: documents.title,
  management_number: documents.managementNumber,
  description: documents.description,
  category_id: documents.categoryId,
  management_division_id: documents.managementDivisionId,
  managed_from_revision_number: documents.managedFromRevisionNumber,
  current_revision_id: documents.currentRevisionId,
  created_at: documents.createdAt,
  created_by: documents.createdBy,
  updated_at: documents.updatedAt,
  updated_by: documents.updatedBy,
  deleted_at: documents.deletedAt,
  deleted_by: documents.deletedBy,
};

const isPostgresError = (error: unknown, code: string): boolean =>
  typeof error === "object" && error !== null && "code" in error &&
  (error as { code?: unknown }).code === code;

const detectFileType = (file: File): DocumentFileType => {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    file.type.includes("excel") ||
    file.type.includes("spreadsheet")
  ) {
    return "xlsx";
  }
  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "word";
  }
  return "image";
};

const uploadFile = async (
  documentId: number,
  revisionId: number,
  file: File
): Promise<string> => {
  assertFileSize(file);
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const storagePath = `${documentId}/${revisionId}/${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (error) {
    console.error("[uploadFile] ファイルアップロードに失敗しました。", error.message);
    throw new Error("ファイルのアップロードに失敗しました。");
  }
  return storagePath;
};

const deleteFile = async (storagePath: string | null | undefined): Promise<void> => {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) console.warn("[deleteFile] 削除に失敗しました。", error.message);
};

const sanitizeDocumentInput = (params: {
  title: string;
  managementNumber: string;
  description: string | null;
}) => ({
  title: sanitizeText(params.title, { maxLength: 200, fieldName: "書類名" }),
  managementNumber: sanitizeText(params.managementNumber, {
    maxLength: 100,
    fieldName: "管理番号",
  }),
  description:
    params.description !== null
      ? sanitizeText(params.description, {
          maxLength: 2000,
          fieldName: "書類の説明",
          allowEmpty: true,
        })
      : null,
});

const cleanupDraftDocument = async (documentId: number, revisionId: number): Promise<void> => {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(revisions).where(eq(revisions.id, revisionId));
      await tx.delete(documents).where(eq(documents.id, documentId));
    });
  } catch {
    console.error("[insertDocument] 補償用のDB削除に失敗しました。");
  }
};

export const insertDocument = async (params: {
  title: string;
  managementNumber: string;
  description: string | null;
  categoryId: number | null;
  managementDivisionId: number;
  managedFromRevisionNumber: number;
  file: File;
  ctx: AuthContext;
}): Promise<DocumentRecord> => {
  const { categoryId, managementDivisionId, managedFromRevisionNumber, file, ctx } = params;
  const sanitized = sanitizeDocumentInput(params);
  if (!Number.isInteger(managementDivisionId) || managementDivisionId <= 0) {
    throw new Error("管理部署IDは正の整数で指定してください。");
  }
  if (!Number.isInteger(managedFromRevisionNumber) || managedFromRevisionNumber < 1) {
    throw new Error("管理開始版番号は1以上の整数を指定してください。");
  }
  if (!file || file.size === 0) throw new Error("ファイルを選択してください。");

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;
  let draft: { documentId: number; revisionId: number };
  try {
    draft = await db.transaction(async (tx) => {
      const [document] = await tx
        .insert(documents)
        .values({
          title: sanitized.title,
          managementNumber: sanitized.managementNumber,
          description: sanitized.description,
          categoryId,
          managementDivisionId,
          managedFromRevisionNumber,
          createdAt: nowIso,
          createdBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .returning({ id: documents.id });
      if (!document) throw new Error("書類の追加に失敗しました。");

      const [revision] = await tx
        .insert(revisions)
        .values({
          documentId: document.id,
          revisionNumber: managedFromRevisionNumber,
          filePath: "",
          fileName: file.name,
          fileType: detectFileType(file),
          fileSize: file.size,
          notes: managedFromRevisionNumber === 1 ? "新規追加" : null,
          createdAt: nowIso,
          createdBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .returning({ id: revisions.id });
      if (!revision) throw new Error("書類版の追加に失敗しました。");
      return { documentId: document.id, revisionId: revision.id };
    });
  } catch {
    console.error("[insertDocument] DB追加に失敗しました。");
    throw new Error("書類の追加に失敗しました。");
  }

  let storagePath: string;
  try {
    storagePath = await uploadFile(draft.documentId, draft.revisionId, file);
  } catch (error) {
    await cleanupDraftDocument(draft.documentId, draft.revisionId);
    throw error;
  }

  try {
    return await db.transaction(async (tx) => {
      await tx.update(revisions).set({ filePath: storagePath }).where(eq(revisions.id, draft.revisionId));
      const [document] = await tx
        .update(documents)
        .set({ currentRevisionId: draft.revisionId, updatedAt: nowIso, updatedBy: userId })
        .where(eq(documents.id, draft.documentId))
        .returning(documentColumns);
      if (!document) throw new Error("書類の最新版情報の更新に失敗しました。");
      return document;
    });
  } catch {
    await deleteFile(storagePath);
    await cleanupDraftDocument(draft.documentId, draft.revisionId);
    console.error("[insertDocument] 最新版情報のDB更新に失敗しました。");
    throw new Error("書類の最新版情報の更新に失敗しました。");
  }
};

export const updateDocument = async (params: {
  documentId: number;
  title: string;
  managementNumber: string;
  description: string | null;
  categoryId: number | null;
  managementDivisionId: number;
  managedFromRevisionNumber: number;
  newFile: File | null;
  ctx: AuthContext;
}): Promise<DocumentRecord> => {
  const { documentId, categoryId, managementDivisionId, managedFromRevisionNumber, newFile, ctx } = params;
  const sanitized = sanitizeDocumentInput(params);
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  let currentRevisionId: number | null;
  try {
    const [currentDocument] = await db
      .select({ currentRevisionId: documents.currentRevisionId })
      .from(documents)
      .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
      .limit(1);
    if (!currentDocument) throw new Error("対象の書類が見つかりませんでした。");
    currentRevisionId = currentDocument.currentRevisionId;
  } catch {
    console.error("[updateDocument] 対象書類のDB取得に失敗しました。");
    throw new Error("対象の書類が見つかりませんでした。");
  }

  const documentUpdate = {
    title: sanitized.title,
    managementNumber: sanitized.managementNumber,
    description: sanitized.description,
    categoryId,
    managementDivisionId,
    managedFromRevisionNumber,
    updatedAt: nowIso,
    updatedBy: userId,
  };

  if (!currentRevisionId) {
    try {
      const [document] = await db
        .update(documents)
        .set(documentUpdate)
        .where(eq(documents.id, documentId))
        .returning(documentColumns);
      if (!document) throw new Error("書類の更新に失敗しました。");
      return document;
    } catch {
      console.error("[updateDocument] DB更新に失敗しました。");
      throw new Error("書類の更新に失敗しました。");
    }
  }

  let storagePath: string | null = null;
  if (newFile && newFile.size > 0) {
    storagePath = await uploadFile(documentId, currentRevisionId, newFile);
  }

  try {
    return await db.transaction(async (tx) => {
      const [document] = await tx
        .update(documents)
        .set(documentUpdate)
        .where(eq(documents.id, documentId))
        .returning(documentColumns);
      if (!document) throw new Error("書類の更新に失敗しました。");

      await tx
        .update(revisions)
        .set(
          storagePath !== null && newFile
            ? {
                filePath: storagePath,
                fileName: newFile.name,
                fileType: detectFileType(newFile),
                fileSize: newFile.size,
                updatedAt: nowIso,
                updatedBy: userId,
              }
            : { updatedAt: nowIso, updatedBy: userId }
        )
        .where(eq(revisions.id, currentRevisionId));
      return document;
    });
  } catch {
    if (storagePath) await deleteFile(storagePath);
    console.error("[updateDocument] DB更新に失敗しました。");
    throw new Error("書類の更新に失敗しました。");
  }
};

export const reviseDocument = async (params: {
  documentId: number;
  title: string;
  managementNumber: string;
  description: string | null;
  categoryId: number | null;
  managementDivisionId: number;
  managedFromRevisionNumber: number;
  notes: string | null;
  newFile: File | null;
  ctx: AuthContext;
}): Promise<RevisionRecord> => {
  const { documentId, categoryId, managementDivisionId, managedFromRevisionNumber, notes, newFile, ctx } = params;
  const sanitized = sanitizeDocumentInput(params);
  const sanitizedNotes = notes !== null
    ? sanitizeText(notes, { maxLength: 2000, fieldName: "改版内容・理由", allowEmpty: true })
    : null;
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  let draft: {
    revision: RevisionRecord;
    previousPath: string | null;
    uploadedFile: boolean;
  };
  try {
    draft = await db.transaction(async (tx) => {
      const [targetDocument] = await tx
        .select({ id: documents.id })
        .from(documents)
        .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
        .limit(1);
      if (!targetDocument) throw new Error("対象の書類が見つかりません。");

      const [latest] = await tx
        .select({
          revisionNumber: revisions.revisionNumber,
          filePath: revisions.filePath,
          fileName: revisions.fileName,
          fileType: revisions.fileType,
          fileSize: revisions.fileSize,
        })
        .from(revisions)
        .where(and(eq(revisions.documentId, documentId), isNull(revisions.deletedAt)))
        .orderBy(desc(revisions.revisionNumber))
        .limit(1);
      const revisionNumber = (latest?.revisionNumber ?? 0) + 1;
      const fileType = newFile ? detectFileType(newFile) : (latest?.fileType ?? "pdf") as DocumentFileType;
      const fileName = newFile ? newFile.name : (latest?.fileName ?? "");
      const fileSize = newFile ? newFile.size : (latest?.fileSize ?? 0);
      const [inserted] = await tx
        .insert(revisions)
        .values({
          documentId,
          revisionNumber,
          filePath: "",
          fileName,
          fileType,
          fileSize,
          notes: sanitizedNotes,
          createdAt: nowIso,
          createdBy: userId,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .returning({ id: revisions.id });
      if (!inserted) throw new Error("改版の登録に失敗しました。");
      return {
        revision: {
          id: inserted.id,
          document_id: documentId,
          revision_number: revisionNumber,
          file_path: "",
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          notes: sanitizedNotes,
          created_at: nowIso,
          created_by: userId,
          updated_at: nowIso,
          updated_by: userId,
          deleted_at: null,
          deleted_by: null,
        },
        previousPath: latest?.filePath ?? null,
        uploadedFile: Boolean(newFile && newFile.size > 0),
      };
    });
  } catch (error) {
    if (isPostgresError(error, "23505")) {
      throw new Error("同時に改訂処理が行われました。画面を再読み込みして、もう一度お試しください。");
    }
    console.error("[reviseDocument] DB追加に失敗しました。");
    throw new Error("改版の登録に失敗しました。");
  }

  let storagePath: string;
  try {
    if (newFile && newFile.size > 0) {
      storagePath = await uploadFile(documentId, draft.revision.id, newFile);
    } else if (draft.previousPath) {
      storagePath = draft.previousPath;
    } else {
      throw new Error("継承元のファイルが見つかりません。新しいファイルを指定してください。");
    }
  } catch (error) {
    await db.delete(revisions).where(eq(revisions.id, draft.revision.id)).catch(() => {
      console.error("[reviseDocument] 補償用のDB削除に失敗しました。");
    });
    throw error;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(revisions).set({ filePath: storagePath }).where(eq(revisions.id, draft.revision.id));
      const [removedDocument] = await tx
        .update(documents)
        .set({
          title: sanitized.title,
          managementNumber: sanitized.managementNumber,
          description: sanitized.description,
          categoryId,
          managementDivisionId,
          managedFromRevisionNumber,
          currentRevisionId: draft.revision.id,
          updatedAt: nowIso,
          updatedBy: userId,
        })
        .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
        .returning({ id: documents.id });
      if (!removedDocument) throw new Error("対象の書類が見つかりません。");
    });
  } catch {
    if (draft.uploadedFile) await deleteFile(storagePath);
    await db.delete(revisions).where(eq(revisions.id, draft.revision.id)).catch(() => {
      console.error("[reviseDocument] 補償用のDB削除に失敗しました。");
    });
    console.error("[reviseDocument] DB更新に失敗しました。");
    throw new Error("改版処理に失敗しました。");
  }
  return draft.revision;
};

export const removeDocument = async (params: {
  documentId: number;
  ctx: AuthContext;
}): Promise<void> => {
  const { documentId, ctx } = params;
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;
  try {
    await db.transaction(async (tx) => {
      const [removedDocument] = await tx
        .update(documents)
        .set({ deletedAt: nowIso, deletedBy: userId, updatedAt: nowIso, updatedBy: userId })
        .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
        .returning({ id: documents.id });
      if (!removedDocument) throw new Error("対象の書類が見つかりません。");
      await tx
        .update(revisions)
        .set({ deletedAt: nowIso, deletedBy: userId, updatedAt: nowIso, updatedBy: userId })
        .where(eq(revisions.documentId, documentId));
    });
  } catch {
    console.error("[removeDocument] DB削除に失敗しました。");
    throw new Error("書類の削除に失敗しました。");
  }
};
