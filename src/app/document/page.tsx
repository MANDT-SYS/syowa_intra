import { auth0 } from "@/lib/auth0";
import Button from '@/components/elements/Button';
import { withAuth } from "@/lib/withAuth";
import { getAllUsers } from "@/server/users/getAllUsers";
import DataGrid from '@/components/elements/DataGrid';


export default async function Document() {

// セッションがある場合
  //初期レンダリング用の全ユーザーデータ取得
  // const allUsers = await withAuth(async () => {
  //   return getAllUsers();
  // });

  // console.log(allUsers);

    return (
      <>
           <section className="min-h-screen  flex flex-col items-center px-4 py-8">
           <div className="w-full max-w-7xl">
            {/* <h1 >
              書類管理画面
            </h1> */}
            <DataGrid />
          </div>
     
        <footer className="mt-16 text-sm text-[#9a948c]">
          © 2026 昭和産業株式会社
        </footer>
      </section>
      </>
    );
  }

