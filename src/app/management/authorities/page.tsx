import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { withAuth } from "@/lib/withAuth";
import { assertCanManageAuthorities } from "@/server/permissions/assertPermissions";
import { getAuthorityUserList } from "@/server/authorities/read";
import AuthorityManagementApp from "@/app/management/authorities/components/AuthorityManagementApp";
import PermissionNotice from "@/components/elements/PermissionNotice";
import {
  getPermissionErrorKind,
  type PermissionErrorKind,
} from "@/server/permissions/permissionErrorHandling";

export const metadata: Metadata = {
  title: "権限設定",
};

export default async function AuthorityManagementPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=%2Fmanagement%2Fauthorities");
  }

  let authorityData: {
    actorUserId: number;
    users: Awaited<ReturnType<typeof getAuthorityUserList>>;
  } | null = null;
  let permissionErrorKind: PermissionErrorKind | null = null;

  try {
    authorityData = await withAuth(async (ctx) => {
    const actorUserId = ctx.user.userId;
    await assertCanManageAuthorities(actorUserId);

    return {
      actorUserId,
      users: await getAuthorityUserList(),
    };
    });

  } catch (error) {
    const kind = getPermissionErrorKind(error);
    if (!kind) {
      throw error;
    }
    if (kind === "resolution") {
      console.error("[AuthorityManagementPage] 権限情報を確認できませんでした。");
    }
    permissionErrorKind = kind;
  }

  if (permissionErrorKind) {
    return <PermissionNotice kind={permissionErrorKind} />;
  }
  if (!authorityData) {
    throw new Error("権限設定画面の初期化に失敗しました。");
  }

  const { actorUserId, users } = authorityData;

  return (
    <section className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl">
        <AuthorityManagementApp actorUserId={actorUserId} initialUsers={users} />
      </div>

      <footer className="mt-16 text-sm text-[#9a948c]">
        © 2026 昭和産業株式会社
      </footer>
    </section>
  );
}
