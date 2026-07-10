// ============================================================
// ② 書類管理 詳細ページ（/document/[id]）
// - Next.js 16 の動的ルーティング
//   ※ params は Promise なので await 必須
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { withAuth } from "@/lib/withAuth";
import {
  getActiveCategories,
  getDocumentDetail,
} from "@/app/document/server/read";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import DocumentDetailApp from "@/app/document/components/DocumentDetailApp";
import type { DivisionInfo } from "@/types/interface";

export const metadata: Metadata = {
  title: "書類詳細",
};

// Next.js 16: params は Promise
type Props = {
  params: Promise<{ id: string }>;
};

export default async function DocumentDetailPage({ params }: Props) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id) || id <= 0) notFound();

  // 認証 + 初期データ並列取得
  const data = await withAuth(async () => {
    const [detail, categories, divisions] = await Promise.all([
      getDocumentDetail(id),
      getActiveCategories(),
      getAllDivisions(),
    ]);
    return {
      detail,
      categories,
      divisions: (divisions ?? []) as DivisionInfo[],
    };
  });

  // 該当書類なしなら404
  if (!data.detail) notFound();

  return (
    <section className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* セクションの幅設定 */}
      {/* <div className="w-full max-w-7xl"> */}
      {/* <div className="w-full max-w-[1500px] mx-auto"></div> */}
      <div className="w-full max-w-screen-2xl mx-auto px-[70px]">
 
        {/* 一覧へ戻るリンク */}
        <Link
          href="/document"
          className="inline-flex items-center gap-1 text-[#5F5E5A] hover:text-[#86171F] mb-3 text-sm"
        >
          <ArrowBackIcon fontSize="small" />
          書類一覧へ戻る
        </Link>

        <DocumentDetailApp
          detail={data.detail}
          categories={data.categories}
          divisions={data.divisions}
        />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
