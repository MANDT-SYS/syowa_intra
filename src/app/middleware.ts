import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// --- 解説 ---
// この middleware は、どのリクエスト（matcher: '/' なのでルートへのアクセス）でも、必ずトップページ ('/') にリダイレクトします。
// 例えば '/calendar' など他パスにアクセスしてもここで '/' に転送されてしまう設計です。
// Next.js の Edge Middleware のサンプルだが、通常は全リクエストリダイレクトは望ましくない。認証チェックや権限によってリダイレクト先などを変える用途が多い。

const ALLOWED_IPS = [
  "153.156.22.153",  // 社内ネットワークのグローバルI
];

function isAllowed(ip: string): boolean {
  // 単純なIP一致チェック（CIDR対応が必要なら別途ライブラリを使用）
  return ALLOWED_IPS.some((allowed) => ip === allowed || ip.startsWith(allowed.replace("/24", "").slice(0, -1)));
}

export function middleware(request: NextRequest) {
  // すべてのアクセスを問答無用でトップページへリダイレクト
  //return NextResponse.redirect(new URL('/', request.url));
  const ip =
  request.headers.get("x-real-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "";

 // Vercelのログに出力される
 console.log("=== Access attempt ===");
 console.log("IP:", ip);
 console.log("Path:", request.nextUrl.pathname);

 if (!ip || !isAllowed(ip)) {
   return new NextResponse("Forbidden", { status: 403 });
 }

return NextResponse.next();
}

export const config = {
  // ルートパス '/' へのアクセス時のみ middleware を適用。
  //matcher: '/',
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};

