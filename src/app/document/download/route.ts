// ============================================================
// 書類ファイルのダウンロード API
// - 同一オリジン経由で Content-Disposition: attachment を返す
// - クロスオリジンの公開URLでは download 属性が効かないためこの経路を使う
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getDocumentDownloadData } from "@/app/document/server/read";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const idStr = req.nextUrl.searchParams.get("id");
  const id = Number(idStr);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "不正なIDです。" }, { status: 400 });
  }

  try {
    const fileData = await withAuth(async () => getDocumentDownloadData(id));

    if (!fileData) {
      return NextResponse.json({ error: "ファイルが見つかりません。" }, { status: 404 });
    }

    const encodedName = encodeURIComponent(fileData.fileName);

    return new NextResponse(fileData.buffer, {
      headers: {
        "Content-Type": fileData.contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }
    console.error("[document/download] 失敗:", e);
    return NextResponse.json({ error: "ダウンロードに失敗しました。" }, { status: 500 });
  }
}
