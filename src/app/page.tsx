// //ホームページ
// import { auth0 } from "@/lib/auth0";
// import { Metadata } from "next";
// import './globals.css';
// import Button from '@/components/elements/Button';
// import TodoApp from '@/features/todo/components/TodoApp';
// import { getTodos } from '@/features/todo/server/read';
// import { withAuth } from "@/lib/withAuth";
// import Image from 'next/image';
// import { QuickLinks } from "@/features/quickLinks/QuickLinks";



// export const metadata: Metadata = {
//   title: process.env.NEXT_PUBLIC_TITLE,//タブ表示タイトル
// };

// export default async function Home() {
//   //ログイン状況の結果でUI表示を分ける為、最初にauth0でログインしたユーザー情報を取得。
//   const session = await auth0.getSession();

//   // セッションがない場合、ログイン前画面（サインアップとログインボタン）を表示
//   if (!session?.user) {
//     return (
//       <main className="min-h-screen  flex flex-col items-center justify-center px-6 py-16">
//         <div className="flex flex-col items-center gap-10 w-full max-w-md">
//           <Image
//             src="/images/昭和イントラサイトロゴ.png"
//             alt="昭和産業イントラサイト"
//             width={780}
//             height={315}
//             className="h-auto w-full max-w-3xl object-contain"
//             priority
//           />
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
//             <a href="/auth/login?screen_hint=signup" className="inline-flex">
//               {/* <Button>Sign up</Button> */}
//             </a>
//             <a href="/auth/login" className="inline-flex">
//               <Button>ログイン</Button>
//             </a>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   // セッションがある場合
//   //初期レンダリング用のデータ取得
//   const todos = await withAuth(async (ctx) => {
//     return getTodos(ctx);
//   });

//   //クイックリンク項目
//   const quickLinkItems = [
//     { href: "/calendar", title: "社内カレンダー", description: "" },
//     { href: "/document", title: "書類管理(開発中)", description: "" },
//     { href: "/", title: "従業員検索(実装予定)",description: "" },
//     { href: "/", title: "申請関連(実装予定)",description: "" },
   
//   ] as const;

//   return (
//     <main>
//       {/* ページ幅を広げる: "max-w-7xl" を指定し余白を調整 */}
      
    
//       <section
//         className={
//           [
//             // 画面の高さを最低でも一杯にする（全画面表示を保証）
//             "min-h-screen",
//             // ページ全体の背景色を指定（生成AI設計書色: #faf9f7）
//             // "bg-[#faf9f7]",
//             // 子要素を縦方向に並べる
//             "flex",
//             "flex-col",
//             // 子要素を中央寄せ（横方向）
//             "items-center",
//             // 子要素を中央寄せ（縦方向）
//             "justify-center",
//             // 横方向の余白を設定
//             "px-4",
//             // 縦方向の余白を設定
//             "py-16",
//           ].join(" ")
//         }
//       >
//         {/* 
//           意味：
//           <main className="w-full max-w-7xl mx-auto text-center space-y-20"> 
//           → ページ本体の主領域（mainタグ）。
//             - w-full: 幅100%
//             - max-w-7xl: 最大幅"7xl"まで（Tailwindの規定で約80rem=1280px程度）
//             - mx-auto: 横中央に配置
//             - text-center: テキスト中央揃え
//             - space-y-40: 子要素間の縦余白をかなり広め（約5rem=80px）に取る
//         */}
//         <main className="w-full max-w-7xl mx-auto text-center space-y-40">
   
//           {/* ロゴ画像を一番上に移動 */}
//           {/* <div className="flex justify-center w-full mt-0">
//             <Image
//               src="/images/昭和イントラサイトロゴ.png"
//               alt="昭和産業イントラサイト"
//               width={640}
//               height={253}
              
//               priority
//             />
//           </div> */}

//           {/* <div className="space-y-4">
//             <p className="text-lg text-[#6b6560] leading-relaxed">
//               昭和産業のイントラサイトです。様々な情報を発信します。
//             </p>
//           </div> */}

//           {/* クイックリンク（カードUI） */}
//           <QuickLinks items={[...quickLinkItems]} />

//           <section>
//             {/* <TodoApp initialTodos={todos} /> */}
//           </section>
//         </main>
  

//         <footer className="mt-16 text-sm text-[#9a948c]">
//           © 2026 昭和産業株式会社
//         </footer>
//       </section>
//     </main>
//   );
// }

// ============================================================================
// 案1：Natural Warm  (ナチュラル・ウォーム)
// ----------------------------------------------------------------------------
// 前提: Next.js 13+ App Router / TypeScript / Tailwind CSS / lucide-react
// 設置先: app/page.tsx
// フォント: app/layout.tsx で next/font を使って設定してください
//   import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
//   const sans  = Noto_Sans_JP({  subsets: ["latin"], variable: "--font-sans"  });
//   const serif = Noto_Serif_JP({ subsets: ["latin"], variable: "--font-serif" });
//   <body className={`${sans.variable} ${serif.variable} font-sans`}>
// ============================================================================

import Image from "next/image";
import {
  Calendar,
  Wallet,
  FileText,
  BookOpen,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import HeroDateWeather from "@/components/elements/HeroDateWeather";
import { auth0 } from "@/lib/auth0";
import Button from "@/components/elements/Button";
import { getLoginUser } from "@/server/users/getLoginUser";
import { withAuth } from "@/lib/withAuth";

type Tone = "important" | "hr" | "general" | "it";
type Announcement = {
  date: string;
  category: string;
  title: string;
  tone: Tone;
  href: string;
};

// ショートカット
const shortcuts = [
  // { icon: Calendar, label: "勤怠",       href: "/attendance" },
  // { icon: Wallet,   label: "経費精算",   href: "/expense"    },
  // { icon: FileText, label: "各種申請",   href: "/forms"      },
   { icon: BookOpen, label: "書類管理", href: "/document"       },
   { icon: Calendar, label: "社内カレンダー",       href: "/calendar" },
  // { icon: Heart,    label: "福利厚生",   href: "/benefits"   },
  // { icon: Users,    label: "社員検索",   href: "/members"    },
] as const;

// お知らせ
const announcements: Announcement[] = [
  { date: "04 / 16", category: "重要", title: "GWの業務体制について（4/29〜5/6）",          tone: "important", href: "#" },
  { date: "04 / 15", category: "人事", title: "2026年度 新入社員紹介ページを公開しました",  tone: "hr",        href: "#" },
  { date: "04 / 12", category: "総務", title: "オフィスの観葉植物メンテナンス実施のお知らせ", tone: "general",   href: "#" },
  { date: "04 / 10", category: "IT",  title: "社内システムメンテナンス（4/20 22:00〜翌2:00）", tone: "it",        href: "#" },
];

// トーンカラーは toneStyles
const toneStyles: Record<Tone, string> = {
  important: "bg-[#86171F] text-white",
  hr:        "bg-[#E8B68E] text-[#4A1B0C]",
  general:   "bg-[#F0E6D2] text-[#5F5E5A]",
  it:        "bg-[#F0E6D2] text-[#5F5E5A]",
};

export default async function HomePage() {
    const session = await auth0.getSession();
    console.log(session);
  
  // セッションがない場合、ログイン前画面（サインアップとログインボタン）を表示
  if (!session?.user) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
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

  else{
     //認証チェック+ログインユーザー情報取得
  const loginUser = await withAuth(async (ctx) => {
    return ctx.user;
  });

    return (
      <>

        {/* ---------- Hero (トップ画像) ---------- */}
        <section className="relative h-[280px] md:h-[520px] overflow-hidden bg-[#E8DFD0]">
          <Image 
            src="/images/syowa_image.png" 
            alt="" 
            fill 
            priority 
            className="object-cover object-[20%_60%]" // 少し上部寄りを見せる
          /> 
    
          <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 h-full flex items-center">
            <div className="max-w-md bg-white/85 backdrop-blur-sm px-7 py-8 md:px-10 md:py-10 rounded-2xl shadow-lg border border-[#E5E2DC] ml-0 md:ml-[-100px]">
              {/* ml-0でモバイルは中央、md以上で左寄りに（調整値は適宜修正可） */}
            

              <h1 className="text-[18px] font-bold  text-[#8A857D] mb-3">
                おかえりなさい、{loginUser.familyName}{loginUser.givenName} さん。
              </h1>
         
              <HeroDateWeather />
        
            </div>
          </div>
    
        </section>

        {/* ---------- Body ---------- */}
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-10 md:py-12 space-y-10">
          {/* ショートカット */}
          <section className="md:-mx-8 xl:-mx-16 px-0">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[var(--font-serif)] text-[17px] font-semibold">
                ショートカット
              </h2>
            </div>
            <ul className="max-w-[1400px] mx-auto px-0 xl:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
              {shortcuts.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="block bg-white rounded-2xl py-7 px-5 text-center transition hover:-translate-y-1 hover:shadow-[0_2px_12px_rgba(134,23,31,0.09)]"
                  >
                    <span className="grid place-items-center w-14 h-14 mx-auto mb-4 rounded-lg bg-[#F0E6D2]">
                      <Icon size={28} strokeWidth={2.1} className="text-[#86171F]" />
                    </span>
                    <span className="text-[15px] text-[#444441] font-medium">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
    

          {/* お知らせ */}
          <section className="md:-mx-8 xl:-mx-16 px-0">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[var(--font-serif)] text-[17px] font-medium">
                お知らせ
              </h2>
              {/* お知らせカテゴリボタン */}
              <div className="flex gap-4 text-[11px]">
                <span className="text-[#86171F] border-b border-[#86171F] pb-0.5">すべて</span>
                <button className="text-[#888780] hover:text-[#2C2C2A]">全社</button>
                <button className="text-[#888780] hover:text-[#2C2C2A]">部署</button>
                <button className="text-[#888780] hover:text-[#2C2C2A]">人事</button>
              </div>
            </div>
            {/* お知らせリスト */}
            <ul className="bg-white rounded-xl overflow-hidden divide-y divide-[#F0E6D2]">
              {/* お知らせリストの中身 */}
              {announcements.map((a) => (
                /* お知らせリストの1件分 */
                <li key={a.title}>

                  <a
                    href={a.href}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAF6EF] transition"
                  >
                    {/* 日付 */}
                    <time className="text-[11px] text-[#888780] min-w-[62px]">{a.date}</time>
                    
                    {/* カテゴリ */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded tracking-[0.05em] ${toneStyles[a.tone]}`}
                    >
                      {a.category}
                    </span>

                    <span className="text-[13px] flex-1 text-[#2C2C2A]">{a.title}</span>
                    <ArrowRight size={14} className="text-[#888780]" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mx-auto max-w-6xl px-6 md:px-10 pb-10 text-[11px] text-[#888780]">
          © 2026 昭和産業株式会社
        </footer>
      </>
    );
  }
}
