// ============================================================
// ① 書類管理トップ（/document）
// - Server Component。認証→初期データ取得→クライアントへ渡す。
// ============================================================

import type { Metadata } from "next";
import { withAuth } from "@/lib/withAuth";
import { getActiveCategories, getDocumentList } from "@/app/document/server/read";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import DocumentApp from "@/app/document/components/DocumentApp";
import type { DivisionInfo } from "@/types/interface";

export const metadata: Metadata = {
  title: "書類管理",
};

export default async function DocumentPage() {
  // 認証チェック付きで書類一覧、カテゴリ一覧、部署一覧のデータ取得
  // （プロジェクトルール：必ず withAuth を通す）
  const { documents, categories, divisions } = await withAuth(async () => {
    // 並列で取得
    const [documents, categories, divisions] = await Promise.all([
      getDocumentList(),//書類一覧取得
      getActiveCategories(),//カテゴリ一覧取得
      getAllDivisions(),//部署一覧取得
    ]);
    return {
      documents,
      categories,
      divisions: (divisions ?? []) as DivisionInfo[],
    };
  });

  return (
    <section className="min-h-screen flex flex-col items-center px-4 py-8">
     {/* セクションの幅設定 */}
      {/* <div className="w-full max-w-7xl"> */}
      <div className="w-full max-w-[1500px] mx-auto">
        {/* 書類一覧、カテゴリ一覧、部署一覧のデータをDocumentAppに渡す */}
        <DocumentApp
          initialDocuments={documents}
          categories={categories}
          divisions={divisions}
        />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
