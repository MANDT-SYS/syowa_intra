import { auth0 } from "@/lib/auth0";
import Button from '@/app/components/elements/Button';
import { withAuth } from "@/lib/withAuth";
import { getAllUsers } from "@/server/getAllUsers";
import DataGrid from '@/app/components/elements/DataGrid';


export default async function Management() {

// セッションがある場合
  //初期レンダリング用の全ユーザーデータ取得
  const allUsers = await withAuth(async (ctx) => {
    return getAllUsers();
  });

  console.log(allUsers);

    return (
      <main>
           <section className="min-h-screen bg-[#faf9f7] flex flex-col items-center px-4 py-8">
           <div className="w-full max-w-7xl">
            <h1 >
              これは管理画面です。
            </h1>
          </div>
     
        <footer className="mt-16 text-sm text-[#9a948c]">
          © 2026 昭和産業株式会社
        </footer>
      </section>
      </main>
    );
  }

