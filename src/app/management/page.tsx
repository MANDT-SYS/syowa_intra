// src/app/management/page.tsx
// ============================================================
// ⑥ 管理画面（/management）
// - Server Component
// - 書類カテゴリの一覧を取得してクライアントに渡す
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { withAuth } from "@/lib/withAuth";
import { getCategoriesWithCount } from "@/app/management/server/read";
import ManagementApp from "@/app/management/components/ManagementApp";
import { getUserPermissions } from "@/server/permissions/getUserPermissions";
import { assertCanAccessManagement } from "@/server/permissions/assertPermissions";
import PermissionNotice from "@/components/elements/PermissionNotice";
import {
  getPermissionErrorKind,
  type PermissionErrorKind,
} from "@/server/permissions/permissionErrorHandling";

export const metadata: Metadata = {
  title: "管理画面",
};

export default async function ManagementPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=%2Fmanagement");
  }

  // 認証・認可 + カテゴリ取得
  let managementData: {
    categories: Awaited<ReturnType<typeof getCategoriesWithCount>>;
    canManageAuthorities: boolean;
  } | null = null;
  let permissionErrorKind: PermissionErrorKind | null = null;

  try {
    managementData = await withAuth(async (ctx) => {
    await assertCanAccessManagement(ctx.user.userId);
    const permissions = await getUserPermissions(ctx.user.userId);
    const categories = await getCategoriesWithCount();
    return { categories, canManageAuthorities: permissions.canManageAuthorities };
    });

  } catch (error) {
    const kind = getPermissionErrorKind(error);
    if (!kind) {
      throw error;
    }
    if (kind === "resolution") {
      console.error("[ManagementPage] 権限情報を確認できませんでした。");
    }
    permissionErrorKind = kind;
  }

  if (permissionErrorKind) {
    return <PermissionNotice kind={permissionErrorKind} />;
  }
  if (!managementData) {
    throw new Error("管理画面の初期化に失敗しました。");
  }

  const { categories, canManageAuthorities } = managementData;

  return (
    <section className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl">
        <ManagementApp
          initialCategories={categories}
          canManageAuthorities={canManageAuthorities}
        />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
