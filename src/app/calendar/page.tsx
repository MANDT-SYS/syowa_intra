import { Metadata } from "next";
import { withAuth } from "@/lib/withAuth";
import { getCalendars } from "@/app/calendar/server/read";
import { getPdfPublicUrl } from "@/app/calendar/server/write";
import CalendarApp from "@/app/calendar/components/CalendarApp";
import type { CalendarWithUrl } from "@/app/calendar/actions";


export const metadata: Metadata = {
  title: "社内カレンダー",
};

export default async function CalendarPage() {
  // withAuthで認証済みのユーザー情報(ctx)を取得し処理を実行
  //calendars: 全カレンダー一覧（calendarアプリに渡すためのデータ）
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
    <>
      <section className="min-h-screen  flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          {/* カレンダーページのタイトル */}
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
          </h1>
          {/* カレンダーページのコンテンツ */}
          <CalendarApp initialCalendars={calendars} />
        </div>
      </section>
    </>
  );
}
