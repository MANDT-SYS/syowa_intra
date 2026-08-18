// src/app/document/server/read.ts
// ============================================================
// 書類管理：データ取得処理（Supabase + 部署API）
// - サーバーコンポーネント、Server Actionの双方から呼ぶ。
// - 1ファイルにまとめて「画面で必要な形」に整形した結果を返す。
// ============================================================

import "server-only";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documentCategories, documents, revisions } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import type {
  DivisionInfo,
  DocumentCategory,
  DocumentDetailData,
  DocumentFileType,
  DocumentListRow,
  RevisionRecord,
} from "@/types/interface";

// Supabase Storage上のバケット名（書類管理用）
const BUCKET = "documents";

// ─────────────────────────────────────────────
// 内部ユーティリティ
// ─────────────────────────────────────────────

// Storage上のpathから公開URLを生成
const getPublicUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

// 部署一覧をMap化（key: divisionId, value: divisionName）
const buildDivisionMap = async (): Promise<Map<number, string>> => {
  const divisions = (await getAllDivisions()) as DivisionInfo[] | undefined;
  const map = new Map<number, string>();
  if (!divisions) return map;
  for (const d of divisions) {
    map.set(d.id, d.divisionName);
  }
  return map;
};

// ─────────────────────────────────────────────
// カテゴリ一覧（論理削除以外）
// 新規追加ダイアログ・編集ダイアログのセレクトボックスで使う
// ─────────────────────────────────────────────
export const getActiveCategories = async (): Promise<DocumentCategory[]> => {
  try {
    return await db
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
      "[getActiveCategories] 取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return [];
  }
};

// ─────────────────────────────────────────────
// 書類一覧（=書類管理トップで表示する一覧）
// - 論理削除されていないdocumentsのみ
// - 最新版のrevisionをJOINで取得（titleと並んで日付など必要なので）
// - カテゴリ名は categories のマップから引く
// - 部署名は外部APIの部署マップから引く
// ─────────────────────────────────────────────
export const getDocumentList = async (): Promise<DocumentListRow[]> => {
  let rows;
  try {
    rows = await db
      .select({
        id: documents.id,
        title: documents.title,
        management_number: documents.managementNumber,
        description: documents.description,
        category_id: documents.categoryId,
        management_division_id: documents.managementDivisionId,
        managed_from_revision_number: documents.managedFromRevisionNumber,
        current_revision_id: documents.currentRevisionId,
        created_at: documents.createdAt,
        category_name: documentCategories.name,
        current_revision_number: revisions.revisionNumber,
        current_file_path: revisions.filePath,
        current_file_name: revisions.fileName,
        current_file_type: revisions.fileType,
        revised_at: revisions.createdAt,
      })
      .from(documents)
      .leftJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
      .leftJoin(revisions, eq(documents.currentRevisionId, revisions.id))
      .where(isNull(documents.deletedAt))
      .orderBy(asc(documents.id));
  } catch (error) {
    console.error(
      "[getDocumentList] 取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return [];
  }

  const divisionMap = await buildDivisionMap();

  return rows.map((row): DocumentListRow => ({
    id: row.id,
    title: row.title,
    management_number: row.management_number,
    description: row.description,
    category_id: row.category_id,
    category_name: row.category_name,
    management_division_id: row.management_division_id,
    division_name: divisionMap.get(row.management_division_id) ?? null,
    managed_from_revision_number: row.managed_from_revision_number,
    current_revision_id: row.current_revision_id,
    current_revision_number: row.current_revision_number,
    file_url: getPublicUrl(row.current_file_path),
    file_name: row.current_file_name,
    file_type: row.current_file_type as DocumentFileType | null,
    created_at: row.created_at,
    revised_at: row.revised_at,
  }));
};

// ─────────────────────────────────────────────
// 書類詳細（1件 + 全改版履歴）
// 詳細ページで使用
// ─────────────────────────────────────────────
export const getDocumentDetail = async (
  documentId: number
): Promise<DocumentDetailData | null> => {
  let docRows;
  try {
    docRows = await db
      .select({
        id: documents.id,
        title: documents.title,
        management_number: documents.managementNumber,
        description: documents.description,
        category_id: documents.categoryId,
        management_division_id: documents.managementDivisionId,
        managed_from_revision_number: documents.managedFromRevisionNumber,
        current_revision_id: documents.currentRevisionId,
        created_at: documents.createdAt,
        category_name: documentCategories.name,
      })
      .from(documents)
      .leftJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
      .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
      .limit(1);
  } catch (error) {
    console.error(
      "[getDocumentDetail] 書類取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return null;
  }
  const doc = docRows[0];
  if (!doc) return null;

  let revisionsRows;
  try {
    revisionsRows = await db
      .select({
        id: revisions.id,
        document_id: revisions.documentId,
        revision_number: revisions.revisionNumber,
        file_path: revisions.filePath,
        file_name: revisions.fileName,
        file_type: revisions.fileType,
        file_size: revisions.fileSize,
        notes: revisions.notes,
        created_at: revisions.createdAt,
        created_by: revisions.createdBy,
        updated_at: revisions.updatedAt,
        updated_by: revisions.updatedBy,
        deleted_at: revisions.deletedAt,
        deleted_by: revisions.deletedBy,
      })
      .from(revisions)
      .where(and(eq(revisions.documentId, documentId), isNull(revisions.deletedAt)))
      .orderBy(desc(revisions.revisionNumber));
  } catch (error) {
    console.error(
      "[getDocumentDetail] 改版取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return null;
  }

  const revisionRecords: RevisionRecord[] = revisionsRows.map((revision) => ({
    ...revision,
    file_type: revision.file_type as DocumentFileType,
  }));
  const currentRev =
    revisionRecords.find((revision) => revision.id === doc.current_revision_id) ??
    revisionRecords[0] ??
    null;

  const divisionMap = await buildDivisionMap();

  return {
    id: doc.id,
    title: doc.title,
    management_number: doc.management_number,
    description: doc.description,
    category_id: doc.category_id,
    category_name: doc.category_name,
    management_division_id: doc.management_division_id,
    division_name: divisionMap.get(doc.management_division_id) ?? null,
    managed_from_revision_number: doc.managed_from_revision_number,
    current_revision_id: doc.current_revision_id,
    current_revision_number: currentRev?.revision_number ?? null,
    file_url: getPublicUrl(currentRev?.file_path ?? null),
    file_name: currentRev?.file_name ?? null,
    file_type: currentRev?.file_type ?? null,
    created_at: doc.created_at,
    revised_at: currentRev?.created_at ?? null,
    revisions: revisionRecords,
  };
};

// ─────────────────────────────────────────────
// 公開URLを生成するヘルパ（クライアントへ公開してOKなURL）
// ─────────────────────────────────────────────
export const getDocumentPublicUrl = (path: string | null): string | null => {
  return getPublicUrl(path);
};

// MIMEタイプ推定（ダウンロードレスポンス用）
const contentTypeFromFile = (
  fileType: string,
  fileName: string
): string => {
  const lower = fileName.toLowerCase();
  if (fileType === "pdf" || lower.endsWith(".pdf")) return "application/pdf";
  if (fileType === "xlsx" || lower.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (lower.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }
  if (fileType === "word" || lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
};

// ダウンロード用：最新版ファイルのバイナリを取得
export const getDocumentDownloadData = async (
  documentId: number
): Promise<{ buffer: ArrayBuffer; fileName: string; contentType: string } | null> => {
  let rows;
  try {
    rows = await db
      .select({
        file_path: revisions.filePath,
        file_name: revisions.fileName,
        file_type: revisions.fileType,
      })
      .from(documents)
      .leftJoin(revisions, eq(documents.currentRevisionId, revisions.id))
      .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
      .limit(1);
  } catch (error) {
    console.error(
      "[getDocumentDownloadData] 書類取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return null;
  }

  const rev = rows[0];

  if (!rev?.file_path) return null;

  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(rev.file_path);

  if (dlErr || !blob) {
    console.error("[getDocumentDownloadData] Storage取得失敗:", dlErr?.message);
    return null;
  }

  const fileName = rev.file_name ?? "download";
  const fileType = rev.file_type ?? "pdf";

  return {
    buffer: await blob.arrayBuffer(),
    fileName,
    contentType: contentTypeFromFile(fileType, fileName),
  };
};
