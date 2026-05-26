// ============================================================
// ⑥ 管理画面（/management）
// - Server Component
// - 書類カテゴリの一覧を取得してクライアントに渡す
// ============================================================

import type { Metadata } from "next";
import { withAuth } from "@/lib/withAuth";
import { getCategoriesWithCount } from "@/app/management/server/read";
import ManagementApp from "@/app/management/components/ManagementApp";

export const metadata: Metadata = {
  title: "管理画面",
};

export default async function ManagementPage() {
  // 認証 + カテゴリ取得
  const categories = await withAuth(async () => {
    return getCategoriesWithCount();
  });

  return (
    <section className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl">
        <ManagementApp initialCategories={categories} />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
