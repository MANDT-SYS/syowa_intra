"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/withAuth";
import {
  insertCalendar,
  updateCalendar,
  removeCalendar,
  getPdfPublicUrl,
} from "@/features/calendar/server/write";
import { getCalendars } from "@/features/calendar/server/read";
import type { CalendarRecord } from "@/types/interface";

export type CalendarWithUrl = CalendarRecord & { pdfUrl: string };

/**
 * カレンダー一覧を取得（公開URL付き）
 */
export const fetchCalendarsAction = async (): Promise<CalendarWithUrl[]> => {
  return withAuth(async (ctx) => {
    const records = await getCalendars(ctx);
    return records.map((r) => ({
      ...r,
      pdfUrl: getPdfPublicUrl(r.storage_path),
    }));
  });
};

/**
 * カレンダーを新規追加
 */
export const addCalendarAction = async (
  formData: FormData
): Promise<CalendarWithUrl> => {
  return withAuth(async (ctx) => {
    const year = Number(formData.get("year"));
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!year || !title || !file) {
      throw new Error("年・タイトル・PDFファイルはすべて必須です。");
    }

    const record = await insertCalendar(year, title, file, ctx);
    revalidatePath("/calendar");
    return {
      ...record,
      pdfUrl: getPdfPublicUrl(record.storage_path),
    };
  });
};

/**
 * カレンダーを更新
 */
export const updateCalendarAction = async (
  formData: FormData
): Promise<CalendarWithUrl> => {
  return withAuth(async (ctx) => {
    const id = formData.get("id") as string;
    const year = Number(formData.get("year"));
    const title = formData.get("title") as string;
    const file = formData.get("file") as File | null;

    if (!id || !year || !title) {
      throw new Error("年・タイトルは必須です。");
    }

    const actualFile = file && file.size > 0 ? file : null;
    const record = await updateCalendar(id, year, title, actualFile, ctx);
    revalidatePath("/calendar");
    return {
      ...record,
      pdfUrl: getPdfPublicUrl(record.storage_path),
    };
  });
};

export type DeleteCalendarResult =
  | { success: true; deletedId: string }
  | { success: false; error: string };

/**
 * カレンダーを削除
 */
export const deleteCalendarAction = async (
  id: string,
  storagePath: string
): Promise<DeleteCalendarResult> => {
  return withAuth(async (ctx) => {
    await removeCalendar(id, storagePath, ctx);
    revalidatePath("/calendar");
    return { success: true, deletedId: id };
  });
};
