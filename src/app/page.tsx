//ホームページ
import { auth0 } from "@/lib/auth0";
import { Metadata } from "next";
import './globals.css';
import Button from '@/app/components/elements/Button';
import TodoApp from '@/features/todo/components/TodoApp';
import { getTodos } from '@/features/todo/server/read';
import { withAuth } from "@/lib/withAuth";
import Image from 'next/image';
import { QuickLinks } from "@/features/quickLinks/QuickLinks";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,//タブ表示タイトル
};

export default async function Home() {
  //ログイン状況の結果でUI表示を分ける為、最初にauth0でログインしたユーザー情報を取得。
  const session = await auth0.getSession();

  // セッションがない場合、サインアップとログインボタンを表示
  if (!session?.user) {
    return (
      <main className="min-h-screen  flex flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center gap-10 w-full max-w-md">
          <Image
            src="/images/昭和イントラサイトロゴ.png"
            alt="昭和産業イントラサイト"
            width={780}
            height={315}
            className="h-auto w-full max-w-3xl object-contain"
            priority
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <a href="/auth/login?screen_hint=signup" className="inline-flex">
              {/* <Button>Sign up</Button> */}
            </a>
            <a href="/auth/login" className="inline-flex">
              <Button>ログイン</Button>
            </a>
          </div>
        </div>
      </main>
    );
  }

  // セッションがある場合
  //初期レンダリング用のデータ取得
  const todos = await withAuth(async (ctx) => {
    return getTodos(ctx);
  });

  //クイックリンク項目
  const quickLinkItems = [
    { href: "/document", title: "書類管理", description: "開発中です" },
    { href: "/calendar", title: "社内カレンダー", description: "社内カレンダーです" },
    { href: "#", title: "お知らせ", description: "開発中です" },
    { href: "#", title: "従業員検索", description: "開発中です" },
  ] as const;

  return (
    <main>
      {/* ページ幅を広げる: "max-w-7xl" を指定し余白を調整 */}
      
    
      <section
        className={
          [
            // 画面の高さを最低でも一杯にする（全画面表示を保証）
            "min-h-screen",
            // ページ全体の背景色を指定（生成AI設計書色: #faf9f7）
            "bg-[#faf9f7]",
            // 子要素を縦方向に並べる
            "flex",
            "flex-col",
            // 子要素を中央寄せ（横方向）
            "items-center",
            // 子要素を中央寄せ（縦方向）
            "justify-center",
            // 横方向の余白を設定
            "px-4",
            // 縦方向の余白を設定
            "py-16",
          ].join(" ")
        }
      >
        <main className="w-full max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
          <div className="flex justify-center w-full">
        <Image
          src="/images/昭和イントラサイトロゴ.png"
          alt="昭和産業イントラサイト"
          width={480}
          height={190}
     
          className="h-auto w-full max-w-xs object-contain mx-auto"
          priority
        />
      </div>
            
            <p className="text-lg text-[#6b6560] leading-relaxed">
              昭和産業のイントラサイトです。様々な情報を発信します。
            </p>
          </div>

          {/* クイックリンク（カードUI） */}
          <QuickLinks items={[...quickLinkItems]} />

          <section>
            <TodoApp initialTodos={todos} />
          </section>
        </main>

        <footer className="mt-16 text-sm text-[#9a948c]">
          © 2026 昭和産業株式会社
        </footer>
      </section>
    </main>
  );
}
