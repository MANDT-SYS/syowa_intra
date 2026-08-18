# 昭和イントラ 開発エージェント規約

## 1. 対象範囲と基本原則

- この `AGENTS.md` は昭和イントラサイト専用です。リポジトリ直下にあり、原則としてリポジトリ全体に適用します。
- 配下に別の `AGENTS.md` がある場合は、より近い階層の指示を優先します。
- 依頼された範囲だけを変更し、無関係なリファクタリング、既存変更の巻き戻し、生成物の編集はしません。
- 事実・推測・提案を分けて報告します。仕様が不明で挙動、権限、データに影響する場合は、一般論で補完せず確認します。
- 最小限の変更で目的を達成します。依頼範囲外の問題を見つけた場合は、無断で大規模修正せず報告します。

## 2. システム概要

- 昭和産業向けの社内イントラサイトです。
- Next.js App Router を使用し、トップ画面、書類管理、書類カテゴリ管理、カレンダー管理を提供します。
- 認証は Auth0、runtime DBアクセスは Drizzle ORM + Postgres.js、ファイルStorageは Supabase Storage を使用します。
- ユーザー・部署情報は外部管理APIから取得します。ローカルDBに存在すると仮定しません。
- Vercel へのデプロイを想定しています。

## 3. 作業開始前に読むファイル

次の順に、対象変更に必要な範囲を確認します。対象ファイルがない場合は、近い役割・同じ機能のファイルを確認します。

1. ルートの `AGENTS.md`
2. `README.md`
3. 対象機能に関係する `docs/*.md`
4. 対象機能の `page.tsx`
5. 対象機能の `actions.ts`
6. 対象機能の `server/read.ts`、`server/write.ts`
7. 対象機能のコンポーネント
8. DB変更時は `docs/intra_db.sql`
9. 認証・セキュリティ関連の変更時は `src/middleware.ts`、`src/lib/withAuth.ts`、`src/lib/auth0.ts`、`src/lib/supabase.ts`

## 4. 技術構成

- Next.js 16.2.0 / App Router
- React 19
- TypeScript（`strict: true`）
- MUI 7 / MUI X Data Grid Pro / Tailwind CSS 4
- Auth0
- Supabase PostgreSQL（Drizzle ORM + Postgres.js経由） / Supabase Storage
- npm
- Vercel

バージョンは `package.json` を正とします。ここに記載された固定バージョンだけを信用せず、依存関係を扱う前に実際の `package.json` とlockfileを確認します。

## 5. ディレクトリと責務

- `src/app/`: 画面、Route Handler、Server Action、機能固有処理
- `src/components/elements/`: 汎用UI部品
- `src/components/layouts/`: 共通レイアウト部品
- `src/lib/`: Auth0、Supabase、入力検証などの共通基盤
- `src/db/`: Drizzle client、schema、relations
- `src/server/`: 外部ユーザー・部署API連携
- `src/types/`: 共通型
- `src/utils/`: 定数・権限定義
- `docs/`: 業務仕様・DB定義
- `public/`: 静的ファイル

機能固有のページ、Server Action、DB処理、コンポーネントは、可能な限り対象機能のディレクトリ内へ置きます。複数機能で再利用するUIのみ `src/components/elements/` または `src/components/layouts/` へ置きます。

## 6. Next.js 16 の実装ルール

- このプロジェクトのNext.jsは従来知識や過去バージョンの慣例と異なる可能性があります。Next.jsに関係する実装前に、インストール済みNext.jsの `node_modules/next/dist/docs/` 配下にある該当のローカル公式ドキュメントを確認します。
- 内部知識や旧バージョンの慣例だけで、App Router、Server Action、Route Handler、Middleware / Proxyを実装・変更しません。
- `node_modules/` は参照専用です。絶対に編集しません。
- 原則として Server Component を使います。ブラウザAPI、イベント処理、状態管理が必要な場合だけ `"use client"` を付けます。
- `src/middleware.ts` はIP制限、Auth0、CSP、matcherを担う全体影響の大きいファイルです。変更前に対象ルート、認証、セキュリティヘッダーへの影響を確認します。
- Next.js 16では`middleware.ts`の旧file conventionにdeprecated警告がありますが、現在の`src/middleware.ts`は有効です。`proxy.ts`への移行・改名は明示的な依頼なしに行いません。
- `src/app/middleware.ts`は削除済みです。古い資料や過去の調査結果を根拠に復活させません。

## 7. 認証・認可

- 保護対象のデータ取得・更新は `withAuth` を経由します。
- Auth0セッションだけでなく、外部ユーザー管理APIへの登録確認が必要です。
- 外部ユーザー・部署APIは既存の10秒timeoutとcache方針を維持します。無期限待機するfetchを追加しません。
- protected pageのAuth0 session確認・ログインredirect導線を、`withAuth`のエラーだけに戻す変更はしません。
- 認証と認可を混同しません。現状の `withAuth` はロール認可を保証していません。
- Phase 5の共通認可は `getUserPermissions` と `assertCan*` を使用します。DEVELOPERは `UserInfo.userId === ConstList.MASTER_AUTHORITY` だけで判定する開発者本人専用の特別権限であり、DBから付与・解除しません。
- AUTHORIZED_USERは `authority_user` と有効な `authority_master` の組合せで判定します。DEVELOPERとAUTHORIZED_USERは権限設定ページの閲覧・他ユーザーの権限変更が可能で、GENERALは利用できません。認可には必ず `withAuth` で得たactorUserIdを使い、画面由来のtargetUserIdを使いません。
- 権限要件が不明な場合は推測して実装しません。
- 書類、カテゴリ、カレンダーの登録・編集・削除権限を変更する場合は、画面上の表示だけでなく、Server Action側の制御も確認します。
- クライアント側で操作を隠すだけをアクセス制御としません。

## 8. セキュリティと秘密情報

- `.env.local` の値を回答、ログ、コード、コミットへ出しません。環境変数を報告する必要がある場合も、名前だけを記載します。
- `SUPABASE_SERVICE_ROLE_KEY`、Auth0シークレット、外部APIキー、DBパスワードを出力しません。
- `SUPABASE_SERVICE_ROLE_KEY` を使用するモジュールはサーバー専用です。Client Componentからimportしません。
- セッション、ユーザー情報、書類一覧、ファイル情報を安易にログ出力しません。
- `src/middleware.ts` のIP制限、Auth0、CSPを変える場合は全体影響を確認します。
- アップロード処理ではクライアント側の `accept` 属性だけを検証とみなしません。ファイル種別、MIME、容量のServer側検証方針を維持します。
- 全アップロードのアプリ上限は50 MiBです。`MAX_UPLOAD_FILE_SIZE_BYTES`を再利用し、Client Component、Server Action、Storage upload直前で検証します。Server Actions / proxyの受信上限55mbを勝手に変更しません。
- 外部入力には既存の `sanitizeText` などを利用し、既存の検証方針を確認します。
- セキュリティ問題を発見しても、依頼範囲外であれば無断で広範囲を変更せず、問題と推奨対応を報告します。

## 9. DB・Supabase Storage

- DBとStorageへのアクセスはServer-onlyに限定し、既存の `import "server-only"` 方針を維持します。
- runtime DBアクセスは `src/db/client.ts` のDrizzle ORM + Postgres.jsだけを使用します。`DATABASE_URL`を使い、`max: 1`、`prepare: false`、`connect_timeout: 10`、`idle_timeout: 20`を維持します。開発時のDrizzle instanceは`globalThis`で再利用し、通常リクエストで`sql.end()`を呼びません。
- `DIRECT_URL`は`drizzle.config.ts`のDB introspection用です。runtimeへ流用しません。
- 当面の正式運用はdatabase-firstです。DB変更は「SQL案を事前提示 → ユーザー承認 → ユーザーがSupabase SQL EditorでDDL実行 → `npm run db:pull` → `src/db/schema.ts` / `src/db/relations.ts`の差分確認 → `docs/intra_db.sql`更新 → lint・型確認・build」の順で行います。
- `src/db/schema.ts` と `src/db/relations.ts` は実DBからの`db:pull`結果を正とします。DBのtable・column・FK・index構造は原則手修正せず、DB変更後に`npm run db:pull`で同期します。
- `db:pull`で保持できない承認済みのDrizzle TypeScript mappingは、再現可能なnormalize処理で補正します。昭和イントラでnumberとして扱うBIGINT / BIGSERIALのID、外部user ID、監査user ID、`revisions.file_size`は、DB型をBIGINTのまま維持し、`scripts/normalize-drizzle-schema.mjs`の明示allowlistにより`mode: "number"`へ補正します。都度の手修正や全BIGINTの一括置換をしません。
- database-first運用中は`drizzle-kit migrate`、`drizzle-kit push`、`drizzle-kit generate`を通常のDB変更フローとして使用しません。migration運用へ切り替える場合は、Drizzle Kit更新、全環境のbaseline設計、ユーザー承認を別作業で行います。
- Supabase JSはStorage専用です。`supabase.from(...)`によるData APIアクセスを新規追加せず、`supabase.storage.from(...)`だけをStorage処理として使用します。Storage呼び出しでは`{ data, error }`を確認します。
- `src/lib/postgres.ts`、`test-db.mjs`、`pg`・`@types/pg`の直接利用、`PG_HOST`、`PG_PORT`、`PG_DATABASE`、`PG_USER`、`PG_PASSWORD`、`PG_SSL`は廃止済みです。新しいDBコードで復活させません。
- transaction callback内のDB操作は必ず引数の`tx`を使います。グローバル`db`、Storage、外部API、Auth0、長時間I/Oをtransaction内へ入れません。`max: 1`のため複数のDB readを不用意に`Promise.all`で並列化しません。
- DBのbigint物理列は維持し、Drizzleでは対象IDを`mode: "number"`で扱います。書類・カテゴリ・revision等のDB内部数値IDは`parsePositiveSafeInteger`、calendar UUIDは`parseUuid`で検証します。外部`UserInfo.userId`は負数を含むsafe integerを取り得るため、権限設定の対象IDは`parseExternalUserId`で検証します。`ConstList.MASTER_AUTHORITY`（現在は`0`）だけはDEVELOPER本人として明示的に変更対象から除外します。
- `documents`、`revisions`、Storageファイルの整合性を崩しません。revisionの正式テーブル名は`revisions`であり、`document_revisions`は使用しません。
- documents・categoriesは論理削除です。通常取得は`deleted_at IS NULL`、削除対象0件は対象なしエラーとします。書類削除ではrevisionsも論理削除し、Storage objectは残します。
- calendarはDB・Storageとも物理削除します。Storage削除にはDBから返された`storage_path`を使い、クライアント由来の推測pathを使いません。
- DB変更時に `docs/intra_db.sql` と実DBが一致すると仮定しません。SQL Editor適用後の`db:pull`結果と差分を確認してから定義書を更新します。RLS、制約、インデックス、Storage公開設定はコードだけでは確認できない場合があります。
- 明示的な依頼なしにSQL、マイグレーション、テーブル変更、RLS変更、Storage操作を実行しません。SQLが必要なら、実行前にコマンド全文、SQL全文、使用環境変数、READ/WRITE、対象、影響、理由を提示して承認を得ます。
- INSERT、UPDATE、DELETE、Storage upload・remove・move等の実DB / Storage操作も、ユーザーの明示承認なしに実行しません。
- DB定義を変更する場合は、適用SQLとロールバック方法を分けて提示します。DBとStorageをまたぐ処理では、途中失敗と補償処理を検討します。

## 10. 書類管理固有ルール

- `documents` は書類本体、`revisions` は版履歴です。新規登録、通常編集、改版を混同しません。
- 改版時は既存revisionを上書きせず、新しいrevisionを追加する現行構造を維持し、最新revision参照の更新を忘れません。
- 書類Storageは`documents` bucketの`<documentId>/<revisionId>/<UUID><ext>`で、`revisions.file_path`を正とします。公開URL・downloadもDBに保存されたpathを使います。
- 改版では新revision用objectを追加し、旧revision objectを削除しません。
- カテゴリの論理削除後も書類の `category_id` を保持する現行仕様を、明示的な依頼なしに変更しません。
- ユーザー・部署情報は外部API由来です。ローカルDBに存在すると仮定しません。
- 公開URL、プレビュー、認証付きダウンロードは役割が異なります。変更前に対象フローを確認します。
- `revision_number = max + 1`には同時改版競合の余地があります。`23505`は再試行案内へ変換済みですが、DBロック等を推測で追加しません。

## 11. カレンダー固有ルール

- `calendar` テーブルと `calendars` Storageバケットを使用します。
- PDFを前提とした実装です。ファイル更新・削除はStorageにも影響します。
- 現行Storage pathは`calendars/<year>/<UUID>.pdf`で、`calendar.storage_path`を正とします。更新は新UUID pathへuploadし、DB成功後に旧objectをbest effort削除します。固定pathへのoverwriteへ戻しません。
- 専用`calendars` bucket内のpathを将来`<year>/<UUID>.pdf`へ簡素化する候補があります。カレンダー機能の大幅改修時に、既存`calendar.storage_path`との互換性・データ移行方針と合わせて対応します。現時点では明示依頼なしにpath方式を変更しません。
- `calendar`テーブルには開発途中の旧形式`calendars/<year>.pdf`を持つ行が残っています。大幅改修まで、明示依頼なしに旧行のDELETE、`storage_path`一括修正、migration、年一意制約追加を行いません。
- Phase 4のStorage棚卸しで、`documents` bucketの旧`calendars/`・`documents/`、`calendars` bucketの旧`calendars/calendars/`・`documents/`は削除済みです。現行実装でこれら旧階層を再生成しません。
- `documents` bucket直下の数値フォルダは現行書類Storageです。旧階層と混同して削除しません。
- 年の一意性と年変更の仕様は、今後のカレンダー大幅改修時に確認します。
- 現行仕様を確認せず、物理削除を論理削除へ変更しません。

## 12. フォント・production build

- `next/font/google`、Geist、Geist Monoは現在使用しません。build時のGoogle Fonts外部通信依存は撤去済みです。
- system fontを使用し、sans-serifは`Arial, Helvetica, sans-serif`、monospaceは`"Courier New", Courier, monospace`です。
- system font化後、`npm run lint`、`npx tsc --noEmit`、`npm run build`は成功確認済みです。Google Fonts取得失敗によるproduction build未確認は解消済みです。
- `src/middleware.ts`のfile conventionに関するdeprecated警告は残っていますが、build失敗ではありません。警告解消を目的に無断で`proxy.ts`へ移行しません。

## 13. コーディング規約

- TypeScriptを使用し、`any` は原則使用しません。型を明示し、既存の共通型があれば再利用します。
- importは `@/*` エイリアスを優先し、既存のファイル配置と命名に合わせます。
- DB・Storage処理は `server/read.ts` と `server/write.ts` の責務分離を維持します。クライアントからの更新はServer Actionを経由します。
- ユーザー向けエラー文とコメントは日本語を基本とします。不要なコメントや、コードをそのまま説明するコメントは増やしません。
- 既存コードはdefault exportを多用しています。READMEのnamed export記載だけを根拠に既存ファイルを一括変更しません。export形式を変更する場合は、対象機能の既存パターンに合わせます。

## 14. 編集対象外と高リスクファイル

原則編集しません。

- `.env.local`
- `node_modules/`
- `.next/`
- `build/`
- `dist/`
- `.git/`
- `next-env.d.ts`
- `tsconfig.tsbuildinfo`
- その他の自動生成物、依頼に関係しないファイル
- lockfile（依存関係変更が明示的に依頼された場合を除く）

特に慎重に扱います。

- `src/middleware.ts`
- `src/lib/withAuth.ts`
- `src/lib/supabase.ts`
- `src/app/document/server/write.ts`
- `src/app/calendar/server/write.ts`
- `docs/intra_db.sql`

`_reference/education_training/`は参照専用です。アプリからimportせず、明示的な依頼なしに変更しません。lint / TypeScriptチェック対象外とし、`.git/info/exclude`の既存方針を維持します。

## 15. 実装後の確認

変更内容に応じて、次の順で確認します。

1. 対象機能の手動確認
2. `npm run lint`
3. 型確認
4. `npm run build`
5. 外部API、Auth0、Supabase、Storage、権限に関係する失敗系の確認

- コマンド実行は依頼内容、環境、影響を確認してから行います。
- `npx tsc --noEmit` は `package.json` に専用スクリプトがないため、実行した場合はその旨を報告します。
- 環境変数や外部サービス不足で確認できない場合は、未実行理由を報告します。
- Vercelの自動デプロイがあっても、ローカルのlintやbuild確認が不要になるわけではありません。
- 直近のPhase 4確認ではlint・型確認・production buildまで成功しています。ただし、将来の変更後も必要な確認を省略しません。

## 16. 作業報告

作業完了時は、最低限次を報告します。

- 変更したファイル
- 変更内容と変更理由
- 影響範囲
- 実行した確認
- 実行していない確認と理由
- DBへの影響
- Storageへの影響
- 環境変数の追加・変更の有無
- 残っている未確認事項
- 依頼範囲外で発見した問題

## 17. 現時点の未確認事項・既知リスク

次は確定仕様ではない、または将来対応が必要な事項です。必要に応じてユーザー確認を行います。

- 書類・カテゴリ・カレンダーなど既存機能への新permission方式の全面適用
- Supabaseの実DBスキーマ、RLSポリシー、Storageバケットの公開設定
- 添付可能な拡張子・MIMEの最終業務要件、ウイルススキャン要件（容量上限50 MiBは確定済み）
- Preview、本番、開発環境の差
- ブランチ、レビュー、デプロイ承認フロー
- `/document/test` の扱い
- DB定義書と実DBの同期状況
- 書類改版の`revision_number = max + 1`による同時更新競合
- 同時カテゴリ登録時の`display_order = max + 1`競合
- カレンダーの年一意性・年変更仕様
- カレンダーStorage pathの`<year>/<UUID>.pdf`への将来簡素化と既存path移行
- カレンダーのDB成功後またはDB削除後にStorage削除が失敗した場合の孤立object
- 書類削除後の読み込み停止（1度のみ発生、その後2回の確認では再現せず・原因未確定）。これを理由に`max: 1`を勝手に変更しない
