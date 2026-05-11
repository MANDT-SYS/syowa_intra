これは、[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) で作成された
 [Next.js](https://nextjs.org) プロジェクトです。

## はじめに
開発用サーバーを起動します。:

```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000) をブラウザで開くと、結果を確認できます。

ページの編集は `app/page.tsx` を修正することで始められます。ページは編集するたびに自動で更新されます。

このプロジェクトでは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を利用し、[Geist](https://vercel.com/font) フォントファミリーを自動的に最適化・読み込みしています。

## 詳細情報
Next.jsについてさらに知りたい場合は、以下のリソースをご覧ください。

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能やAPIについて解説しています。
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsのチュートリアルです。

[the Next.js GitHub repository](https://github.com/vercel/next.js) でソースコードやフィードバック、コントリビュートも可能です！

## Vercelへのデプロイ

最も簡単にNext.jsアプリをデプロイする方法は、Next.js開発元が提供している [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を利用することです。

より詳しい手順については [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) をご確認ください。


# プロジェクト概要
- Next.js (App Router) + TypeScript のWebアプリ
- ホスティング: Vercel
- DB: Supabase
- Storage:Supabase
- 認証: Auth0

# 技術スタック
- Next.js 14+ (App Router)
- TypeScript
- Supabase (@supabase/supabase-js)
- githubと連携
- githubにプッシュすることで自動でVercel にデプロイ

# コーディング規約
- 言語は TypeScript。any 禁止、型を明示する
- コンポーネントはすべて関数コンポーネント + named export
- `"use client"` は必要な場合のみ付与。デフォルトは Server Component
- データの登録や変更、削除、取得の際の認証は`lib/withAuth.ts`のwithAuthを通す。

# ディレクトリ構成
- `src/` ディレクトリ配下に、アプリの全てのソースコード・ロジック・ページ・コンポーネントを格納する。
  - `app/`: Next.js App Router の各ページ（ルーティングごとにディレクトリを分割）
    - 機能ごと（例: calendar, document, my_page）にディレクトリを作成し、その中に
    `page.tsx`（画面本体）
    `components/`（その機能専用のUI部品）
    `server/`（DB呼び出しなどのサーバーサイドロジック）
    `actions.ts`（サーバーアクションやエンドポイント）
    等を必要に応じて配置する。
    - 例:  
      - `calendar/`
        - `page.tsx` : ページ本体
        - `components/CalendarApp.tsx` : calendarコンポーネント
        - `components/CalendarDialog.tsx` : calendar登録・更新ダイアログコンポーネント
        - `server/read.ts` : 読込処理
        - `server/write.ts` : 登録・更新処理
        - `actions.ts` : サーバーアクション
  - `components/`: 全体で共通利用する汎用UIコンポーネント（例: Button, DataGrid など）
  - `lib/`: SupabaseやAuth0などの外部サービス連携・ユーティリティ・認証処理やAPIクライアント
  - `types/`: 型定義（TypeScriptのインターフェイスや型エイリアス）

# Supabase ルール
- クライアント生成は `lib/supabase.ts`
- クエリビルダーで記述

# エラーハンドリング
- Supabase の呼び出しは `{ data, error }` を必ずチェック
- ユーザー向けエラーは日本語で表示

# レスポンス言語
- コード中のコメントは日本語
- 説明・回答も日本語で行う

# その他
- ユーザー取得は上田さんAPIを使用して経理サーバーのpostgresから取得
