// ============================================================
// 書類管理：登録・編集・改版・削除（DB + Storage）
// - 全てサーバー専用。Server Action から呼び出す前提。
// - DB操作とStorage操作は片方失敗時にもう片方をロールバックできるよう順番に注意。
// ============================================================

import "server-only";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { sanitizeText } from "@/lib/sanitize";
import type {
  AuthContext,
  DocumentFileType,
  DocumentRecord,
  RevisionRecord,
} from "@/types/interface";

// Supabase Storage上のバケット名
const BUCKET = "documents";

// ─────────────────────────────────────────────
// 内部ユーティリティ
// ─────────────────────────────────────────────

// ファイルの拡張子・MIMEから DocumentFileType を判定
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
  // 画像（png/jpg/jpeg/gif/webp 等）
  return "image";
};

// Storageへファイルをアップロード（成功時は path を返す）
// pathの形式: {documentId}/{revisionId}/{ファイル名}
const uploadFile = async (
  documentId: number,
  revisionId: number,
  file: File
): Promise<string> => {
  // 拡張子だけ取り出す
 const ext = file.name.includes(".")
 ? file.name.slice(file.name.lastIndexOf("."))
 : "";
 // Storage上のファイル名は ASCII のみ（ランダムUUID + 拡張子）
 // ※ documents/revisions の id ではなく crypto.randomUUID() で生成した一意な文字列
 const storageFileName = `${crypto.randomUUID()}${ext}`;
 const storagePath = `${documentId}/${revisionId}/${storageFileName}`;

 // DB の revisions.file_name には元の名前をそのまま保存
 // file_name: file.name  ← これは既存のまま

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    console.error("[uploadFile] アップロード失敗:", error.message);
    throw new Error("ファイルのアップロードに失敗しました。");
  }

  return storagePath;
};

// Storageからファイルを削除（失敗してもログだけ）
const deleteFile = async (storagePath: string | null | undefined): Promise<void> => {
  if (!storagePath) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.warn("[deleteFile] 削除失敗（無視）:", error.message);
  }
};

// 共通：書類入力値のサニタイズ
const sanitizeDocumentInput = (params: {
  title: string;
  managementNumber: string;
  description: string | null;
}) => {
  return {
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
  };
};

// ─────────────────────────────────────────────
// ③登録ダイアログから呼ばれる：書類の新規追加
//  1. documents に INSERT（current_revision_id は後で更新）
//  2. revisions に INSERT（revision_number = managed_from_revision_number）
//     ※ BIGSERIAL により id は DB 側で自動採番される
//  3. ファイルを Storage に PUT
//  4. revisions.file_path / file_name / file_type / file_size を更新
//  5. documents.current_revision_id を新しい revision_id に更新
// ─────────────────────────────────────────────
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
  const sanitized = sanitizeDocumentInput({
    title: params.title,
    managementNumber: params.managementNumber,
    description: params.description,
  });

  if (!Number.isInteger(managementDivisionId) || managementDivisionId <= 0) {
    throw new Error("立案部署は必須です。");
  }
  if (!Number.isInteger(managedFromRevisionNumber) || managedFromRevisionNumber < 1) {
    throw new Error("管理開始版数は1以上の整数を指定してください。");
  }
  if (!file || file.size === 0) {
    throw new Error("ファイルを選択してください。");
  }

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  // 1) documents INSERT
  const { data: docInserted, error: docErr } = await supabase
    .from("documents")
    .insert({
      title: sanitized.title,
      management_number: sanitized.managementNumber,
      description: sanitized.description,
      category_id: categoryId,
      management_division_id: managementDivisionId,
      managed_from_revision_number: managedFromRevisionNumber,
      created_at: nowIso,
      created_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .select()
    .single();

  if (docErr || !docInserted) {
    console.error("[insertDocument] documents追加失敗:", docErr?.message);
    throw new Error("書類の登録に失敗しました。");
  }

  // 2) revisions INSERT（ファイル情報はダミーで入れ、後でUPDATE）
  const { data: revInserted, error: revErr } = await supabase
    .from("revisions")
    .insert({
      document_id: docInserted.id,
      revision_number: managedFromRevisionNumber,
      file_path: "", // 後でUPDATE
      file_name: file.name,
      file_type: detectFileType(file),
      file_size: file.size,
      notes: managedFromRevisionNumber === 1 ? "新規追加" : null,
      created_at: nowIso,
      created_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .select()
    .single();

  if (revErr || !revInserted) {
    console.error("[insertDocument] revisions追加失敗:", revErr?.message);
    // documentsだけ残ると孤児になるので削除して整合性を保つ（物理削除）
    await supabase.from("documents").delete().eq("id", docInserted.id);
    throw new Error("書類版の登録に失敗しました。");
  }

  // 3) Storageへファイルアップロード
  let storagePath: string;
  try {
    storagePath = await uploadFile(docInserted.id, revInserted.id, file);
  } catch (e) {
    // 失敗したらDBもロールバック
    await supabase.from("revisions").delete().eq("id", revInserted.id);
    await supabase.from("documents").delete().eq("id", docInserted.id);
    throw e;
  }

  // 4) revisions.file_path を実際のパスに更新
  await supabase.from("revisions").update({ file_path: storagePath }).eq("id", revInserted.id);

  // 5) documents.current_revision_id を更新
  const { data: docFinal, error: docUpdErr } = await supabase
    .from("documents")
    .update({ current_revision_id: revInserted.id, updated_at: nowIso, updated_by: userId })
    .eq("id", docInserted.id)
    .select()
    .single();

  if (docUpdErr || !docFinal) {
    console.error("[insertDocument] current_revision_id更新失敗:", docUpdErr?.message);
    throw new Error("書類の最新版情報の更新に失敗しました。");
  }

  return docFinal as DocumentRecord;
};

// ─────────────────────────────────────────────
// ④編集ダイアログから呼ばれる：書類の編集（メタ情報修正・ファイル差し替え）
//  - documents をUPDATE
//  - ファイル差し替えがある場合は revisions の file_* も UPDATE（revision_number は変えない）
//  - 差し替え有無に関わらず revisions.updated_at / updated_by は更新
// ─────────────────────────────────────────────
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
  const {
    documentId,
    categoryId,
    managementDivisionId,
    managedFromRevisionNumber,
    newFile,
    ctx,
  } = params;

  const sanitized = sanitizeDocumentInput({
    title: params.title,
    managementNumber: params.managementNumber,
    description: params.description,
  });

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  // 現在の documents を取得（current_revision_id を知るため）
  const { data: currentDoc, error: getErr } = await supabase
    .from("documents")
    .select("id, current_revision_id")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (getErr || !currentDoc) {
    console.error("[updateDocument] 対象書類取得失敗:", getErr?.message);
    throw new Error("対象の書類が見つかりませんでした。");
  }

  // documents UPDATE
  const { data: docUpdated, error: docErr } = await supabase
    .from("documents")
    .update({
      title: sanitized.title,
      management_number: sanitized.managementNumber,
      description: sanitized.description,
      category_id: categoryId,
      management_division_id: managementDivisionId,
      managed_from_revision_number: managedFromRevisionNumber,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("id", documentId)
    .select()
    .single();

  if (docErr || !docUpdated) {
    console.error("[updateDocument] 更新失敗:", docErr?.message);
    throw new Error("書類の更新に失敗しました。");
  }

  // 現在版（current_revision_id）に対する更新
  if (currentDoc.current_revision_id) {
    if (newFile && newFile.size > 0) {
      // ファイル差し替え：新しいパスへアップロードし、revisionsを更新
      // パスは {documentId}/{revisionId}/{filename}
      const newPath = await uploadFile(documentId, currentDoc.current_revision_id, newFile);

      await supabase
        .from("revisions")
        .update({
          file_path: newPath,
          file_name: newFile.name,
          file_type: detectFileType(newFile),
          file_size: newFile.size,
          updated_at: nowIso,
          updated_by: userId,
        })
        .eq("id", currentDoc.current_revision_id);
    } else {
      // 差し替えなしでも updated_at / updated_by だけは更新
      await supabase
        .from("revisions")
        .update({
          updated_at: nowIso,
          updated_by: userId,
        })
        .eq("id", currentDoc.current_revision_id);
    }
  }

  return docUpdated as DocumentRecord;
};

// ─────────────────────────────────────────────
// ⑤改版ダイアログから呼ばれる：新しい版の追加
//  - 新しい revisions レコードを追加（revision_number = 既存最大 + 1）
//  - 新しいファイルが指定されていればアップロード、なければ前版の file_* をコピー
//  - documents.current_revision_id を新しい revision_id に更新
// ─────────────────────────────────────────────
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
  const {
    documentId,
    categoryId,
    managementDivisionId,
    managedFromRevisionNumber,
    notes,
    newFile,
    ctx,
  } = params;

  const sanitized = sanitizeDocumentInput({
    title: params.title,
    managementNumber: params.managementNumber,
    description: params.description,
  });

  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  // 既存の最大 revision_number を取得
  const { data: maxRow, error: maxErr } = await supabase
    .from("revisions")
    .select("revision_number, file_path, file_name, file_type, file_size")
    .eq("document_id", documentId)
    .is("deleted_at", null)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxErr) {
    console.error("[reviseDocument] 最大版取得失敗:", maxErr.message);
    throw new Error("改版処理に失敗しました。");
  }

  const nextRevisionNumber = (maxRow?.revision_number ?? 0) + 1;

  // 新しい revisions レコードを INSERT
  // ファイルは後でUPDATEするため一旦 file_path = "" でいれる
  const { data: revInserted, error: revErr } = await supabase
    .from("revisions")
    .insert({
      document_id: documentId,
      revision_number: nextRevisionNumber,
      file_path: "",
      // 仮値：新ファイルがあればこの後の処理で更新する。
      // 新ファイルがない場合は前版の値をそのまま使う。
      file_name: newFile ? newFile.name : maxRow?.file_name ?? "",
      file_type: newFile ? detectFileType(newFile) : maxRow?.file_type ?? "pdf",
      file_size: newFile ? newFile.size : maxRow?.file_size ?? 0,
      notes:
        notes !== null
          ? sanitizeText(notes, {
              maxLength: 2000,
              fieldName: "改版内容・理由",
              allowEmpty: true,
            })
          : null,
      created_at: nowIso,
      created_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .select()
    .single();

  if (revErr || !revInserted) {
    console.error("[reviseDocument] 新版INSERT失敗:", revErr?.message);
    throw new Error("改版の登録に失敗しました。");
  }

  // ファイル処理
  let storagePath: string;
  try {
    if (newFile && newFile.size > 0) {
      // 新ファイルをアップロード
      storagePath = await uploadFile(documentId, revInserted.id, newFile);
    } else if (maxRow?.file_path) {
      // ファイル差し替え無し → 前版のpathを継承
      storagePath = maxRow.file_path;
    } else {
      throw new Error("継承元のファイルが存在しません。新しいファイルを指定してください。");
    }
  } catch (e) {
    await supabase.from("revisions").delete().eq("id", revInserted.id);
    throw e;
  }

  await supabase.from("revisions").update({ file_path: storagePath }).eq("id", revInserted.id);

  // documents本体も更新（メタ情報の更新も合わせて反映）
  await supabase
    .from("documents")
    .update({
      title: sanitized.title,
      management_number: sanitized.managementNumber,
      description: sanitized.description,
      category_id: categoryId,
      management_division_id: managementDivisionId,
      managed_from_revision_number: managedFromRevisionNumber,
      current_revision_id: revInserted.id,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("id", documentId);

  return revInserted as RevisionRecord;
};

// ─────────────────────────────────────────────
// 削除ダイアログから呼ばれる：書類の論理削除
//  - documents.deleted_at / deleted_by を更新
//  - 関連する revisions の deleted_at / deleted_by も更新
//  ※ Storageファイルは履歴のため残す（ハード削除はしない）
// ─────────────────────────────────────────────
export const removeDocument = async (params: {
  documentId: number;
  ctx: AuthContext;
}): Promise<void> => {
  const { documentId, ctx } = params;
  const nowIso = new Date().toISOString();
  const userId = ctx.user.userId;

  // documents
  const { error: docErr } = await supabase
    .from("documents")
    .update({
      deleted_at: nowIso,
      deleted_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("id", documentId);

  if (docErr) {
    console.error("[removeDocument] 書類削除失敗:", docErr.message);
    throw new Error("書類の削除に失敗しました。");
  }

  // revisions（同じ書類の全版を論理削除）
  const { error: revErr } = await supabase
    .from("revisions")
    .update({
      deleted_at: nowIso,
      deleted_by: userId,
      updated_at: nowIso,
      updated_by: userId,
    })
    .eq("document_id", documentId);

  if (revErr) {
    console.error("[removeDocument] 版削除失敗:", revErr.message);
    // 親の削除は成功しているので、ここでthrowしてユーザーに気付かせる
    throw new Error("書類は削除しましたが、版データの削除でエラーが発生しました。");
  }
};
