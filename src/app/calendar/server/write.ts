// src/app/calendar/server/write.ts
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { calendar } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import type { AuthContext, CalendarRecord } from "@/types/interface";
import { sanitizeText } from "@/lib/sanitize";
import { assertFileSize } from "@/lib/fileSize";

const BUCKET = "calendars";

const calendarColumns = {
  id: calendar.id,
  year: calendar.year,
  title: calendar.title,
  storage_path: calendar.storagePath,
  created_at: calendar.createdAt,
  updated_at: calendar.updatedAt,
  Priority: calendar.priority,
};

/**
 * PDFをSupabase Storageにアップロードし、storage_pathを返す
 */
const uploadPdf = async (year: number, file: File): Promise<string> => {
  assertFileSize(file);
  //storagePathを生成。ファイル名は年.pdf
  const storagePath = `calendars/${year}/${crypto.randomUUID()}.pdf`;
  // PDFファイル（Fileオブジェクト）はそのままsupabase-jsのstorageにはアップロードできないため、
  // まずファイルの中身をarrayBuffer（＝生のバイト配列）として取得し、
  // それをNode.jsのBuffer（バイト列を扱うクラス。バイナリファイルやバイト操作でよく使う）に変換する。
  // Supabase StorageのアップロードAPIはNode.js環境ではBuffer（またはUint8Array等）の形式を期待するためこの変換が必要。
  const buffer = Buffer.from(await file.arrayBuffer());

  //サービスロールキーを使用して、Storageにアップロード
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
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
  const { error } = await supabase.storage
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

  let inserted: CalendarRecord | undefined;
  try {
    [inserted] = await db
      .insert(calendar)
      .values({
        year,
        title: sanitizedTitle,
        storagePath,
      })
      .returning(calendarColumns);
  } catch {
    await deletePdf(storagePath);
    console.error("カレンダーDB追加に失敗しました。");
    throw new Error("カレンダーの追加に失敗しました。");
  }

  if (!inserted) {
    throw new Error("追加後のカレンダー取得に失敗しました。");
  }

  return inserted;
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
  let previousStoragePath: string | undefined;
  if (file) {
    const [existing] = await db
      .select({ storagePath: calendar.storagePath })
      .from(calendar)
      .where(eq(calendar.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("対象のカレンダーが見つかりません。");
    }

    previousStoragePath = existing.storagePath;
    storagePath = await uploadPdf(year, file);
  }

  const updateData = storagePath
    ? { title: sanitizedTitle, updatedAt: new Date().toISOString(), storagePath }
    : { title: sanitizedTitle, updatedAt: new Date().toISOString() };

  let updated: CalendarRecord | undefined;
  try {
    [updated] = await db
      .update(calendar)
      .set(updateData)
      .where(eq(calendar.id, id))
      .returning(calendarColumns);
  } catch {
    if (storagePath) await deletePdf(storagePath);
    console.error("カレンダーDB更新に失敗しました。");
    throw new Error("カレンダーの更新に失敗しました。");
  }

  if (!updated) {
    if (storagePath) await deletePdf(storagePath);
    throw new Error("更新後のカレンダー取得に失敗しました。");
  }

  if (
    storagePath &&
    previousStoragePath &&
    previousStoragePath !== storagePath
  ) {
    await deletePdf(previousStoragePath);
  }

  return updated;
};

/**
 * カレンダーレコードの削除（DB + Storage）
 */
export const removeCalendar = async (
  id: string,
  ctx: AuthContext
): Promise<void> => {
  let removed: { id: string; storagePath: string } | undefined;
  try {
    [removed] = await db
      .delete(calendar)
      .where(eq(calendar.id, id))
      .returning({ id: calendar.id, storagePath: calendar.storagePath });
    if (!removed) throw new Error("対象のカレンダーが見つかりません。");
  } catch {
    console.error("カレンダーDB削除に失敗しました。");
    throw new Error("カレンダーの削除に失敗しました。");
  }

  if (!removed) {
    throw new Error("対象のカレンダーが見つかりません。");
  }

  await deletePdf(removed.storagePath);
};

/**
 * storage_path を元にSupabaseのStorageの公開URLを生成
 */
export const getPdfPublicUrl = (storagePath: string): string => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
};
