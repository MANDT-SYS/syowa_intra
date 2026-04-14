import { Metadata } from "next";
import { withAuth } from "@/lib/withAuth";
import { getCalendars } from "@/features/calendar/server/read";
import { getPdfPublicUrl } from "@/features/calendar/server/write";
import CalendarApp from "@/features/calendar/components/CalendarApp";
import type { CalendarWithUrl } from "@/features/calendar/actions";

export const metadata: Metadata = {
  title: "社内カレンダー",
};

export default async function CalendarPage() {
  // withAuthで認証済みのユーザー情報(ctx)を取得し処理を実行
  const calendars = await withAuth(async (ctx) => {
    // getCalendarsでカレンダーレコード一覧を取得
    const records = await getCalendars(ctx);
    // 各レコードに対してPDFの公開URLを付与してCalendarWithUrl型に変換
    return records.map((r): CalendarWithUrl => ({
      ...r,
      pdfUrl: getPdfPublicUrl(r.storage_path),
    }));
  });

  return (
    <main>
      <section className="min-h-screen bg-[#faf9f7] flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            社内カレンダー
          </h1>
          <CalendarApp initialCalendars={calendars} />
        </div>
      </section>
    </main>
  );
}
