/**
 * Auth0のサーバーサイド用シングルトンクライアントを初期化するモジュール。
 * 
 * - "server-only"でサーバーサイドでのみインポート可能に制限（Next.jsフレームワーク依存）。
 * - Auth0の公式SDKの Auth0Client を初期化しエクスポート。
 * - .env.localから環境変数でAuth0情報を取得・自動設定（SDK側で読み込まれる）。
 * 
 * 他のサーバーサイドコード（例: API Routeやサーバーコンポーネント）で
 * `import { auth0 } from "@/lib/auth0";` の形で認証・セッション操作に利用する。
 */
import "server-only";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Auth0 サーバー用クライアント（シングルトンとしてエクスポート）
export const auth0 = new Auth0Client();