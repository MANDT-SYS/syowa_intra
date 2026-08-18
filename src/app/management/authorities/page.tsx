import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { withAuth } from "@/lib/withAuth";
import { assertCanManageAuthorities } from "@/server/permissions/assertPermissions";
import { getAuthorityUserList } from "@/server/authorities/read";
import AuthorityManagementApp from "@/app/management/authorities/components/AuthorityManagementApp";

export const metadata: Metadata = {
  title: "権限設定",
};

export default async function AuthorityManagementPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=%2Fmanagement%2Fauthorities");
  }

  const { actorUserId, users } = await withAuth(async (ctx) => {
    const actorUserId = ctx.user.userId;
    await assertCanManageAuthorities(actorUserId);

    return {
      actorUserId,
      users: await getAuthorityUserList(),
    };
  });

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
