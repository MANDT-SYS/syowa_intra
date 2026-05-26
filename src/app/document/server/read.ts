// ============================================================
// 書類管理：データ取得処理（Supabase + 部署API）
// - サーバーコンポーネント、Server Actionの双方から呼ぶ。
// - 1ファイルにまとめて「画面で必要な形」に整形した結果を返す。
// ============================================================

import "server-only";
import { supabase, supabaseAdmin } from "@/lib/supabase";
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
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
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
  const { data, error } = await supabase
    .from("document_categories")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getActiveCategories] 取得失敗:", error.message);
    return [];
  }
  return (data ?? []) as DocumentCategory[];
};

// ─────────────────────────────────────────────
// 書類一覧（=書類管理トップで表示する一覧）
// - 論理削除されていないdocumentsのみ
// - 最新版のrevisionをJOINで取得（titleと並んで日付など必要なので）
// - カテゴリ名は categories のマップから引く
// - 部署名は外部APIの部署マップから引く
// ─────────────────────────────────────────────
export const getDocumentList = async (): Promise<DocumentListRow[]> => {
  // Supabaseのrelationship指定で「current_revision_id → revisions.id」の単一行取得
  // current_revision_id がない（初版未登録など）場合は null になる
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        id,
        title,
        management_number,
        description,
        category_id,
        management_division_id,
        managed_from_revision_number,
        current_revision_id,
        created_at,
        document_categories:category_id ( id, name ),
        current_revision:current_revision_id (
          id,
          revision_number,
          file_path,
          file_name,
          file_type,
          created_at
        )
      `
    )
    .is("deleted_at", null)
    .order("id", { ascending: true });

  if (error) {
    console.error("[getDocumentList] 取得失敗:", error.message);
    return [];
  }

  const divisionMap = await buildDivisionMap();

  // Supabaseのリレーション結果はオブジェクト or 配列で返るためここで安全に取り出す
  type Joined = {
    id: number;
    title: string;
    management_number: string;
    description: string | null;
    category_id: number | null;
    management_division_id: number;
    managed_from_revision_number: number;
    current_revision_id: number | null;
    created_at: string;
    document_categories: { id: number; name: string } | { id: number; name: string }[] | null;
    current_revision:
      | {
          id: number;
          revision_number: number;
          file_path: string;
          file_name: string;
          file_type: DocumentFileType;
          created_at: string;
        }
      | null;
  };

  const rows: DocumentListRow[] = ((data as unknown as Joined[]) ?? []).map((d) => {
    // categoryは relationship 設定によってはオブジェクト or 配列で返る。
    // 両方に対応して name を取り出す。
    const cat = Array.isArray(d.document_categories)
      ? d.document_categories[0] ?? null
      : d.document_categories;
    const rev = d.current_revision;
    return {
      id: d.id,
      title: d.title,
      management_number: d.management_number,
      description: d.description,
      category_id: d.category_id,
      category_name: cat?.name ?? null,
      management_division_id: d.management_division_id,
      division_name: divisionMap.get(d.management_division_id) ?? null,
      managed_from_revision_number: d.managed_from_revision_number,
      current_revision_id: d.current_revision_id,
      current_revision_number: rev?.revision_number ?? null,
      file_url: getPublicUrl(rev?.file_path ?? null),
      file_name: rev?.file_name ?? null,
      file_type: rev?.file_type ?? null,
      created_at: d.created_at,
      revised_at: rev?.created_at ?? null,
    };
  });

  return rows;
};

// ─────────────────────────────────────────────
// 書類詳細（1件 + 全改版履歴）
// 詳細ページで使用
// ─────────────────────────────────────────────
export const getDocumentDetail = async (
  documentId: number
): Promise<DocumentDetailData | null> => {
  // 本体取得
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select(
      `
        id,
        title,
        management_number,
        description,
        category_id,
        management_division_id,
        managed_from_revision_number,
        current_revision_id,
        created_at,
        document_categories:category_id ( id, name )
      `
    )
    .eq("id", documentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (docErr) {
    console.error("[getDocumentDetail] 書類取得失敗:", docErr.message);
    return null;
  }
  if (!doc) return null;

  // 改版履歴（新しい順）
  const { data: revs, error: revErr } = await supabase
    .from("revisions")
    .select("*")
    .eq("document_id", documentId)
    .is("deleted_at", null)
    .order("revision_number", { ascending: false });

  if (revErr) {
    console.error("[getDocumentDetail] 改版取得失敗:", revErr.message);
    return null;
  }

  const revisions = (revs ?? []) as RevisionRecord[];
  const currentRev =
    revisions.find((r) => r.id === doc.current_revision_id) ??
    revisions[0] ??
    null;

  // categoryは relationship 設定によってはオブジェクト or 配列で返るためここで安全に処理
  const cat = Array.isArray(doc.document_categories)
    ? doc.document_categories[0] ?? null
    : (doc.document_categories as { id: number; name: string } | null);

  const divisionMap = await buildDivisionMap();

  return {
    id: doc.id,
    title: doc.title,
    management_number: doc.management_number,
    description: doc.description,
    category_id: doc.category_id,
    category_name: cat?.name ?? null,
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
    revisions,
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
  fileType: DocumentFileType,
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
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select(
      `
        id,
        current_revision_id,
        current_revision:current_revision_id (
          file_path,
          file_name,
          file_type
        )
      `
    )
    .eq("id", documentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (docErr || !doc) {
    console.error("[getDocumentDownloadData] 書類取得失敗:", docErr?.message);
    return null;
  }

  const rev = Array.isArray(doc.current_revision)
    ? doc.current_revision[0] ?? null
    : doc.current_revision;

  if (!rev?.file_path) return null;

  const { data: blob, error: dlErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(rev.file_path);

  if (dlErr || !blob) {
    console.error("[getDocumentDownloadData] Storage取得失敗:", dlErr?.message);
    return null;
  }

  const fileName = rev.file_name ?? "download";
  const fileType = (rev.file_type ?? "pdf") as DocumentFileType;

  return {
    buffer: await blob.arrayBuffer(),
    fileName,
    contentType: contentTypeFromFile(fileType, fileName),
  };
};
