import "server-only";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { AuthContext, CalendarRecord } from "@/types/interface";
import { sanitizeText } from "@/lib/sanitize";

const BUCKET = "calendars";

/**
 * PDFをSupabase Storageにアップロードし、storage_pathを返す
 */
const uploadPdf = async (year: number, file: File): Promise<string> => {
  //storagePathを生成。ファイル名は年.pdf
  const storagePath = `calendars/${year}.pdf`;
  // PDFファイル（Fileオブジェクト）はそのままsupabase-jsのstorageにはアップロードできないため、
  // まずファイルの中身をarrayBuffer（＝生のバイト配列）として取得し、
  // それをNode.jsのBuffer（バイト列を扱うクラス。バイナリファイルやバイト操作でよく使う）に変換する。
  // Supabase StorageのアップロードAPIはNode.js環境ではBuffer（またはUint8Array等）の形式を期待するためこの変換が必要。
  const buffer = Buffer.from(await file.arrayBuffer());

  //サービスロールキーを使用して、Storageにアップロード
  const { error } = await supabaseAdmin.storage 
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("PDFアップロード失敗:", error.message);
    throw new Error("PDFのアップロードに失敗しました。");
  }

  return storagePath;
};

/**
 * Storageからファイルを削除
 */
const deletePdf = async (storagePath: string): Promise<void> => {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("PDFファイル削除失敗:", error.message);
  }
};

/**
 * カレンダーレコードの新規追加
 */
export const insertCalendar = async (
  year: number,
  title: string,
  file: File,
  ctx: AuthContext
): Promise<CalendarRecord> => {
  const sanitizedTitle = sanitizeText(title, {
    maxLength: 200,
    fieldName: "タイトル",
  });

  const storagePath = await uploadPdf(year, file);

  const { data, error } = await supabase
    .from("calendar")
    .insert({
      year,
      title: sanitizedTitle,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) {
    await deletePdf(storagePath);
    console.error("カレンダー追加失敗:", error.message);
    throw new Error("カレンダーの追加に失敗しました。");
  }

  if (!data) {
    throw new Error("追加後のカレンダー取得に失敗しました。");
  }

  return data;
};

/**
 * カレンダーレコードの更新（タイトルのみ or タイトル+PDF）
 */
export const updateCalendar = async (
  id: string,
  year: number,
  title: string,
  file: File | null,
  ctx: AuthContext
): Promise<CalendarRecord> => {
  const sanitizedTitle = sanitizeText(title, {
    maxLength: 200,
    fieldName: "タイトル",
  });

  let storagePath: string | undefined;
  if (file) {
    storagePath = await uploadPdf(year, file);
  }

  const updateData: Record<string, unknown> = {
    title: sanitizedTitle,
    updated_at: new Date().toISOString(),
  };
  if (storagePath) {
    updateData.storage_path = storagePath;
  }

  const { data, error } = await supabase
    .from("calendar")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("カレンダー更新失敗:", error.message);
    throw new Error("カレンダーの更新に失敗しました。");
  }

  if (!data) {
    throw new Error("更新後のカレンダー取得に失敗しました。");
  }

  return data;
};

/**
 * カレンダーレコードの削除（DB + Storage）
 */
export const removeCalendar = async (
  id: string,
  storagePath: string,
  ctx: AuthContext
): Promise<void> => {
  const { error } = await supabase
    .from("calendar")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("カレンダー削除失敗:", error.message);
    throw new Error("カレンダーの削除に失敗しました。");
  }

  await deletePdf(storagePath);
};

/**
 * storage_path を元にSupabaseのStorageの公開URLを生成
 */
export const getPdfPublicUrl = (storagePath: string): string => {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
};
