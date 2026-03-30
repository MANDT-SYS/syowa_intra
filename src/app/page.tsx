//ホームページ
import { auth0 } from "@/lib/auth0";
import { Metadata } from "next";
import './globals.css';
import Button from '@/app/components/elements/Button';
import TodoApp from '@/features/todo/components/TodoApp';
import { getTodos } from '@/features/todo/server/read';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,//タブ表示タイトル
};

export default async function Home() {
  //auth0でログインしたユーザー情報を取得
  const session = await auth0.getSession();

  // セッションがない場合、サインアップとログインボタンを表示
  if (!session) {
    return (
      <main>
        <p>ログインしてください</p>
        <p>はやく！</p>
        <a href="/auth/login?screen_hint=signup">
          <Button>Sign up</Button>
        </a>
        <a href="/auth/login">
          <Button>Log in</Button>
        </a>
      </main>
    );
  }

  // セッションがある場合
  //初期レンダリング用のデータ取得
  const todos = await getTodos();

  const links = [
    { href: "/about", label: "会社概要" },
    { href: "#", label: "人事ポータル" },
    { href: "#", label: "お知らせ" },
    { href: "#", label: "FAQ" },
  
  ];

  return (
    <main>
      
      {/* <Image src="/サンプル.png" alt="sample" width={150} height={150} /> */}
    
    <section className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-xl text-center space-y-12">
        
        <div className="space-y-4">
          <h1 className="text-2xl font-medium tracking-wide text-[#3d3a36]">
            昭和産業株式会社 イントラサイト
          </h1>
          <p className="text-lg text-[#6b6560] leading-relaxed">
            昭和産業のイントラサイトです。
          </p>
        </div>

        {/* クイックリンク */}
        <nav className="flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-5 py-2.5 rounded-lg bg-white/80 border border-[#e8e4df] text-[#5a5550] hover:bg-white hover:border-[#c4a77d] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
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

