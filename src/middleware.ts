// middlewareは、Next.jsアプリにリクエストが来た時（すべてのルートやAPI）に最初に実行され、
// リクエスト/レスポンスをフィルタ/書き換え/リダイレクト等できる「リクエストの入口」で呼び出されます。
// 具体的には
// - すべてのページリクエスト
// - API routes
// - 静的ファイル・Assets
// などに対してURLパターン等で「適用対象だけ」実行されます。
// 認証（ログイン判定）やセキュリティヘッダー付与、リダイレクト等をアプリグローバルに適用したい場合に使われます。

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

// アクセスを許可するIPアドレスリスト（ここでは社内ネットワークのグローバルIPを指定）
const ALLOWED_IPS = [
  "153.156.22.153",  // 社内ネットワークのグローバルIP
  "182.168.181.143",

];

// IPv4アドレス（例: 153.156.22.153）を32bitの数値に変換する関数
function ipToNum(ip: string): number {
  // "."で区切って配列にし、左シフトと加算で32ビット数値に詰める
  // 例: [153,156,22,153] -> (153<<24) + (156<<16) + (22<<8) + 153
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

// 指定したIPアドレスがALLOWED_IPSリストに含まれているか判定する関数
function isAllowed(ip: string): boolean {
  // 入力IPアドレスを数値化
  const ipNum = ipToNum(ip);

  // ALLOWED_IPS配列の全要素を走査
  return ALLOWED_IPS.some((entry) => {
    // CIDR表記（xxx.xxx.xxx.xxx/xx）が含まれている場合
    if (entry.includes("/")) {
      // 基点IPとプレフィックス長部分に分割
      const [base, prefix] = entry.split("/");
      // サブネットマスク作成（プレフィックス長だけビットを立てる。例：/24→255.255.255.0）
      const mask = ~((1 << (32 - Number(prefix))) - 1) >>> 0;
      // 入力IPと基点IPをマスクで比較。ネットワーク部が一致すれば許可
      return (ipNum & mask) === (ipToNum(base) & mask);
    }
    // 単一のIP（CIDRでない）なら完全一致で判定
    return ip === entry;
  });
}

// 認証＆セキュリティヘッダ付与用ミドルウェア
export async function middleware(request: NextRequest) {

  // 開発環境判定（unsafe-eval許可制御用）
  const isDev = process.env.NODE_ENV === "development";

  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";

  if (!isDev) {
    if (!ip || !isAllowed(ip)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Auth0 がリダイレクト（ログイン画面への誘導,、認証エラー等）を返した場合は
  // CSP を付けずにそのまま返す
  //リダイレクトのレスポンスには HTML のボディがない（あっても表示されない）ので、スクリプトが実行される余地がない。
  // CSP は「ブラウザがHTMLを描画するとき」に効くものなので、リダイレクトに CSP を付けても意味がない。
  //攻撃者が XSS を仕掛けるのは「ページが表示される（200）」とき。
  // リダイレクト（302）のレスポンスにスクリプトを注入しても、ブラウザはそのHTMLを描画せずに飛ぶので意味がない。
  // 認証ミドルウェア実行（返されたレスポンスヘッダーを引き継ぐ）
  const response = await auth0.middleware(request);

  if (response.status !== 200) {
    return response;
  }

  // セキュリティ対策（XSSの保険）：リクエストの度に、middleware内でscript-srcで使うランダムなnonceを生成
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Content-Security-Policyヘッダ生成（各行詳細はコメント参照）
  const csp = [
    // ① 既定：同一オリジンのみ許可（全体のデフォルト許可先）
    "default-src 'self'",
    // ② スクリプト実行元制限
    // - 'self'：同一オリジン可
    // - 'nonce-${nonce}'：動的に生成したnonce共通（Next.js側でnonce付スクリプトだけ有効）
    // - 'strict-dynamic'：nonceがあればインライン/外部双方許可
    // - 'unsafe-eval'（evalはJavaScriptのコードを動的に実行するための機能。安全性の面から通常は禁止だが、開発中はデバッグ目的で使われることがあるため、development環境のみ許可）
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // ③ CSSの許可元
    // - 'self'：同一オリジン可
    // - 'unsafe-inline'：インラインstyle可
    `style-src 'self' 'unsafe-inline'`,
    // ④ 画像の読み込み元
    // - 'self'：同一オリジン
    // - 'data:'：data URL経由
    // - https:：外部HTTPSも可
    "img-src 'self' data: https:",
    // ⑤ フォント取得先制限
    // - 'self', 'https:', 'data:'全許可
    "font-src 'self' https: data:",
    // ⑥ オブジェクト要素完全禁止
    "object-src 'none'",
    // ⑦ <base>タグの値制御
    "base-uri 'self'",
    // ⑧ フォーム送信先制限
    "form-action 'self'",
    // ⑨ フレーム埋込禁止：クリックジャッキング等への対策
    "frame-ancestors 'none'",
    // ⑩ API通信等：接続先制限
    "connect-src 'self'",
    // ⑪ 混在コンテンツ対策：常にHTTPSへ自動アップグレード
    "upgrade-insecure-requests",
    //Vercelのプレビュー機能（コメントUIとか）が iframe で読み込むのを容認
    "frame-src 'self' https://vercel.live https://*.supabase.co",
  ].join("; ");

  // ヘッダ複製＆セキュリティ値追加
  const requestHeaders = new Headers(request.headers);
  // script用ノンス値をリクエストヘッダにも追加
  requestHeaders.set("x-nonce", nonce);
  // CSPポリシーヘッダ追加
  requestHeaders.set("Content-Security-Policy", csp);

  // 応答のためのレスポンスを新たに作成（ヘッダー反映）
  const newResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // auth0側で設定されたヘッダーも引き継ぐ
  response.headers.forEach((value, key) => {
    newResponse.headers.set(key, value);
  });
  // 念のため最終的なCSPもここで付与（競合防止）
  newResponse.headers.set("Content-Security-Policy", csp);

  return newResponse;
}

// ミドルウェアのマッチャー: 静的ファイル・プリフェッチリクエスト等は除外
export const config = {
  matcher: [
    {
      // _next配下や一部静的ファイル等以外が対象
      source: "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      // routerのプリフェッチによる通信を除外
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
