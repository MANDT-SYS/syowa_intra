// src/app/document/test/page.tsx
import { auth0 } from "@/lib/auth0";
import Button from '@/components/elements/Button';
import { withAuth } from "@/lib/withAuth";
import { getAllUsers } from "@/server/users/getAllUsers";
import { getAllDivisions } from "@/server/divisions/getAllDivisions";
import DataGrid from '@/components/elements/DataGrid';


export default async function Document() {

// セッションがある場合
  //初期レンダリング用の全ユーザーデータ取得
  // const allUsers = await withAuth(async () => {
  //   return getAllUsers();
  // });

  //初期レンダリング用の全部署データ取得
//   const allDivisions = await withAuth(async () => {
//     return getAllDivisions();
//   });

    return (
      <>
           <section className="min-h-screen  flex flex-col items-center px-4 py-8">
           <div className="w-full max-w-7xl">
            <h1 >
              aaaaaaaaaaaaaaa
            </h1>

          </div>
     
        <footer className="mt-16 text-sm text-[#9a948c]">
          © 2026 昭和産業株式会社
        </footer>
      </section>
      </>
    );
  }

