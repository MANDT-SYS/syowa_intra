// src/app/document/page.tsx
// ============================================================
// ① 書類管理トップ（/document）
// - Server Component。認証→初期データ取得→クライアントへ渡す。
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { withAuth } from "@/lib/withAuth";
import { getActiveCategories, getDocumentList } from "@/app/document/server/read";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import DocumentApp from "@/app/document/components/DocumentApp";
import type { DivisionInfo } from "@/types/interface";

export const metadata: Metadata = {
  title: "書類管理",
};

export default async function DocumentPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=%2Fdocument");
  }

  // 認証チェック付きで書類一覧、カテゴリ一覧、部署一覧のデータ取得
  // （プロジェクトルール：必ず withAuth を通す）
  const { documents, categories, divisions } = await withAuth(async () => {
    // 並列で取得
    const documents = await getDocumentList();
    const categories = await getActiveCategories();
    const divisions = await getAllDivisions();
    /*
      getDocumentList(),//書類一覧取得
      getActiveCategories(),//カテゴリ一覧取得
      getAllDivisions(),//部署一覧取得
    */
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
      {/* <div className="w-full max-w-[1500px] mx-auto"> */}
      <div className="w-full max-w-screen-2xl mx-auto px-[70px]">
        {/* 書類一覧、カテゴリ一覧、部署一覧のデータをDocumentAppに渡す */}
        <DocumentApp
          initialDocuments={documents}//書類一覧
          categories={categories}//カテゴリー一覧
          divisions={divisions}//部署一覧
        />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
