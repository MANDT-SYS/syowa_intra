// src/app/calendar/server/read.ts
import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { calendar } from "@/db/schema";
import type { CalendarRecord, AuthContext } from "@/types/interface";

// カレンダー一覧を取得する関数
export const getCalendars = async (ctx: AuthContext): Promise<CalendarRecord[]> => {
  try {
    return await db
      .select({
        id: calendar.id,
        year: calendar.year,
        title: calendar.title,
        storage_path: calendar.storagePath,
        created_at: calendar.createdAt,
        updated_at: calendar.updatedAt,
        Priority: calendar.priority,
      })
      .from(calendar)
      .orderBy(desc(calendar.year));
  } catch (error) {
    console.error(
      "カレンダー一覧取得失敗:",
      error instanceof Error ? error.message : "不明なエラー"
    );
    return [];
  }
};
