
# 書類管理機能概要・ルール
    DBテーブル
    下記のように作成。

    前提として、ユーザー、部署は外部DBを使用している為、ユーザー、部署関連のcolumnは外部キーでつなぐようなことはない。

        -- ============================================================
        -- document_categories（書類カテゴリーマスタテーブル）
        -- カテゴリーの追加・管理を柔軟に行うためのマスタテーブル。
        -- documentsテーブルからidで参照される。
        -- ============================================================

        CREATE TABLE document_categories (
            -- 主キー：カテゴリーを一意に識別するUUID（自動生成）
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            -- カテゴリー名（例：'規程'、'申請書'、'マニュアル'）
            name TEXT NOT NULL UNIQUE,

            -- 表示順（セレクトボックスでの並び順制御用）
            display_order INT NOT NULL DEFAULT 0,

            -- カテゴリーの登録日時
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- カテゴリーの登録者（ログインユーザーのuser_id）
            created_by BIGINT NOT NULL,

            -- カテゴリーの最終更新日時
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- カテゴリーの最終更新者（ログインユーザーのuser_id）
            updated_by BIGINT NOT NULL ,

            -- 論理削除日時（NULLなら有効、値があれば無効化済み）
            deleted_at TIMESTAMPTZ,

            -- 論理削除実行者（ログインユーザーのuser_id）
            deleted_by BIGINT
        );

        -- テーブルコメント
        COMMENT ON TABLE document_categories IS '書類カテゴリーのマスタテーブル。セレクトボックスの選択肢を管理。';

        -- カラムコメント
        COMMENT ON COLUMN document_categories.id IS '主キー（UUID自動生成）';
        COMMENT ON COLUMN document_categories.name IS 'カテゴリー名（ユニーク制約あり）';
        COMMENT ON COLUMN document_categories.display_order IS 'セレクトボックスでの表示順（昇順）';
        COMMENT ON COLUMN document_categories.created_at IS '登録日時';
        COMMENT ON COLUMN document_categories.created_by IS '登録者（user_id）';
        COMMENT ON COLUMN document_categories.updated_at IS '最終更新日時';
        COMMENT ON COLUMN document_categories.updated_by IS '最終更新者（user_id）';
        COMMENT ON COLUMN document_categories.deleted_at IS '論理削除日時（NULLなら有効）';
        COMMENT ON COLUMN document_categories.deleted_by IS '論理削除実行者（user_id）';

        -- 初期データ投入
        -- ※ created_by にはシステム管理者のuser_id:0(bigInt)を指定してください
        -- INSERT INTO document_categories (name, display_order, created_by) VALUES
        --     ('規程',       1, {管理者のuser_id}),
        --     ('申請書',     2, {管理者のuser_id}),
        --     ('マニュアル', 3, {管理者のuser_id});


        -- ============================================================
        -- documents（ドキュメント本体テーブル）
        -- 書類のメタ情報を管理する親テーブル。
        -- 1つのdocumentに対して複数のrevision（版）が紐づく。
        -- ============================================================

        CREATE TABLE documents (
            -- 主キー：ドキュメントを一意に識別するUUID（自動生成）
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            -- 書類のタイトル（例：「出張申請書」「情報セキュリティ規程」）
            title TEXT NOT NULL,

            -- 書類の管理番号（例：「SK-総-30」「SS-005」）
            management_number TEXT NOT NULL,

            -- 書類説明
            description TEXT,

            -- カテゴリーID（document_categoriesテーブルへの外部キー）
            -- カテゴリーが削除されてもドキュメントは残すためSET NULL
            category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,

            -- 立案部署id（この書類を管轄する部署）
            management_division_id TEXT NOT NULL,

            -- 管理開始版数
            managed_from_revision_number INT NOT NULL DEFAULT 1,

            -- 最新版のrevision ID（revisionsテーブルへの外部キー）
            -- 一覧画面では、この参照先のrevisionを表示する
            -- ※ revisionsテーブル作成後に外部キー制約を追加する（循環参照回避）
            current_revision_id UUID,

            -- ドキュメントの初回登録日時
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- ドキュメントの初回登録者（ログインユーザーのuser_id）
            created_by BIGINT NOT NULL,

            -- ドキュメントの最終更新日時
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- ドキュメントの最終更新者（ログインユーザーのuser_id）
            updated_by BIGINT NOT NULL,

            -- 論理削除日時（NULLなら未削除、値があれば削除済み）
            deleted_at TIMESTAMPTZ,

            -- 論理削除を実行したユーザー（ログインユーザーのuser_id）
            deleted_by BIGINT
        );

        -- テーブルコメント
        COMMENT ON TABLE documents IS '書類フォーマットの本体テーブル。1書類につき1レコード。';

        -- カラムコメント
        COMMENT ON COLUMN documents.id IS '主キー（UUID自動生成）';
        COMMENT ON COLUMN documents.title IS '書類タイトル';
        COMMENT ON COLUMN documents.management_number IS '書類の管理番号';
        COMMENT ON COLUMN documents.description IS '書類内容の説明';
        COMMENT ON COLUMN documents.category_id IS 'カテゴリーID（FK → document_categories.id）';
        COMMENT ON COLUMN documents.management_division_id IS '立案部署ID';
        COMMENT ON COLUMN documents.managed_from_revision_number IS 'このシステムで管理を開始した版番号。既存書類を途中版から登録する場合は5などを設定する。';
        COMMENT ON COLUMN documents.current_revision_id IS '最新版のrevision ID。一覧表示に使用';
        COMMENT ON COLUMN documents.created_at IS '初回登録日時';
        COMMENT ON COLUMN documents.created_by IS '初回登録者（ログインユーザーのuser_id）';
        COMMENT ON COLUMN documents.updated_at IS '最終更新日時';
        COMMENT ON COLUMN documents.updated_by IS '最終更新者（ログインユーザーのuser_id）';
        COMMENT ON COLUMN documents.deleted_at IS '論理削除日時（NULLなら有効）';
        COMMENT ON COLUMN documents.deleted_by IS '論理削除実行者（ログインユーザーのuser_id）';


        -- ============================================================
        -- revisions（版テーブル）
        -- ドキュメントの各版（バージョン）を管理する子テーブル。
        -- 改版のたびに新しいレコードが追加される。
        -- ============================================================

        CREATE TABLE revisions (
            -- 主キー：版を一意に識別するUUID（自動生成）
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            -- 親ドキュメントのID（documentsテーブルへの外部キー）
            -- ドキュメント削除時に版も一緒に処理するためCASCADE設定
            document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

            -- 版番号（1から始まる連番、同一document内で一意）
            -- 改版のたびにインクリメントされる
            revision_number INT NOT NULL,

            -- Supabase Storage上のファイルパス
            -- 例：'{document_id}/{revision_id}/filename.pdf'
            file_path TEXT NOT NULL,

            -- アップロード時の元ファイル名（ダウンロード時に使用）
            -- 例：'出張申請書_v2.xlsx'
            file_name TEXT NOT NULL,

            -- ファイル形式（プレビュー方法の判定に使用）
            -- 'pdf' / 'xlsx' / 'image' のいずれか
            file_type TEXT NOT NULL,

            -- ファイルサイズ（バイト単位）
            -- 表示用・バリデーション用
            file_size BIGINT NOT NULL,

            -- 改版内容・理由（編集内容や改版理由を記録）
            -- 初版の場合はNULL可
            notes TEXT,

            -- この版の登録日時 = 改版日時
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- この版の登録者 = 改版者（user_id）
            created_by BIGINT NOT NULL,

            -- この版の最終更新日時 = この版データの編集日時
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- この版の最終更新者 = この版データの編集者（user_id）
            updated_by BIGINT NOT NULL,

            -- 版単位の論理削除日時（通常はdocument単位で削除するが、個別版の削除にも対応）
            deleted_at TIMESTAMPTZ,

            -- 版単位の論理削除実行者（user_id）
            deleted_by BIGINT,

            -- 同一ドキュメント内で版番号が重複しないようにする制約
            CONSTRAINT uq_document_revision UNIQUE (document_id, revision_number)
        );

        -- テーブルコメント
        COMMENT ON TABLE revisions IS '書類の版（リビジョン）テーブル。改版のたびにレコード追加。';

        -- カラムコメント
        COMMENT ON COLUMN revisions.id IS '主キー（UUID自動生成）';
        COMMENT ON COLUMN revisions.document_id IS '親ドキュメントのID（FK → documents.id）';
        COMMENT ON COLUMN revisions.revision_number IS '版番号（1, 2, 3...）同一document内で連番';
        COMMENT ON COLUMN revisions.file_path IS 'Supabase Storage上のファイル保存パス';
        COMMENT ON COLUMN revisions.file_name IS 'アップロード時の元ファイル名';
        COMMENT ON COLUMN revisions.file_type IS 'ファイル形式（pdf / xlsx / image）';
        COMMENT ON COLUMN revisions.file_size IS 'ファイルサイズ（バイト）';
        COMMENT ON COLUMN revisions.notes IS '改版メモ・変更理由（初版はNULL可）';
        COMMENT ON COLUMN revisions.created_at IS 'この版の登録日時（= 改版日時）';
        COMMENT ON COLUMN revisions.created_by IS 'この版の登録者（user_id）';
        COMMENT ON COLUMN revisions.updated_at IS 'この版の最終更新日時（= この版データの編集日時）';
        COMMENT ON COLUMN revisions.updated_by IS 'この版の最終更新者（user_id）';
        COMMENT ON COLUMN revisions.deleted_at IS '版単位の論理削除日時（NULLなら有効）';
        COMMENT ON COLUMN revisions.deleted_by IS '版単位の論理削除実行者（user_id）';


        -- ============================================================
        -- 外部キー制約の追加（循環参照を避けるため後から追加）
        -- documents.current_revision_id → revisions.id
        -- ============================================================

        ALTER TABLE documents
            ADD CONSTRAINT fk_documents_current_revision
            FOREIGN KEY (current_revision_id)
            REFERENCES revisions(id)
            ON DELETE SET NULL;

        COMMENT ON CONSTRAINT fk_documents_current_revision ON documents
            IS 'documents.current_revision_id → revisions.id への外部キー。版削除時はNULLにリセット';


        -- ============================================================
        -- インデックス
        -- ============================================================

        -- 一覧画面: 未削除ドキュメントの取得を高速化
        CREATE INDEX idx_documents_not_deleted
            ON documents (deleted_at)
            WHERE deleted_at IS NULL;

        -- 一覧画面: カテゴリーでの絞り込み
        CREATE INDEX idx_documents_category_id
            ON documents (category_id);

        -- 一覧画面: 部署での絞り込み
        CREATE INDEX idx_documents_management_division_id
            ON documents (management_division_id);

        -- 一覧画面: タイトル検索用
        CREATE INDEX idx_documents_title
            ON documents (title);

        -- 詳細画面: 特定ドキュメントの全版を取得
        CREATE INDEX idx_revisions_document_id
            ON revisions (document_id);

        -- 詳細画面: 版番号順での取得を高速化
        CREATE INDEX idx_revisions_document_revision
            ON revisions (document_id, revision_number DESC);

        -- カテゴリーマスタ: 未削除のカテゴリーを表示順で取得
        CREATE INDEX idx_document_categories_active
            ON document_categories (display_order)
            WHERE deleted_at IS NULL;



    ## Supabase Storage
    - バケット名: `documents`
    - 対応拡張子：word,excel,pdf,png,jpeg,image

    ## 画面レイアウト
    - 大体のイメージは添付画像①②③④⑤⑥⑥を参考にお願い。
  

    ## ①書類管理トップ
    ホームのページのショートカット「書類管理書類管理」ボタンからとばせる画面。
    - 画像①のように
        ・書類の検索バー（）
        ・フィルター（例：指定カテゴリで絞れる等）
        ・新規追加ボタン
        に加え
        ・カテゴリ追加ボタン（管理画面の書類管理アコーディオンに飛ばすだけでいい。）
    -新規追加ボタンはクリックするとダイアログを表示させる。

    - ページ遷移時にdocumentsテーブルの全データを取得する（削除済みデータは除く）
    - 取得したデータをリスト（DataGrid）表の中に入れる。（新規追加ボタンの下に配置）
    　※１番新しい版のデータを表示。
      - カラムは
      　・書類タイトル
      　・管理番号
        ・カテゴリー名（document_categoriesテーブル内idとdocumentテーブル内category_idと同じもののカテゴリー名を表示
        　（比較の際は一応ナンバー型に変換してから行う。））
        ・立案部署
        ・登録日付
        ・改版日付
        ・詳細ボタン(画像①のような目のアイコンではなく書類系のアイコンに設定してほしい)
      　・ダウンロードボタン
        
    - リスト表の上に検索、フィルター、新規追加ボタンを配置。

    

        
    ## ②書類管理詳細
    - ①書類管理トップの各行に存在する詳細ボタンをクリックしたらページ遷移。（app routerの動的ルーティング）
        /documents              ← リスト表ページ
        /documents/[id]         ← 詳細ページ
    
        詳細ページでは下記を表示
        ・ファイルのプレビュー
        ・メタ情報
        ・改版履歴（日付、改版者）
        ・ダウンロードボタン（一覧にもあるが、プレビューを見て確認してからダウンロードしたい場合、詳細画面にもあった方が親切。）
        　配置場所はプレビューの上
        ・改版ボタン
        ・編集ボタン

        改版ボタン、編集ボタン はクリックするとダイアログを表示させる。



    ## ③.登録ダイアログ
    - ①書類管理トップの新規追加ボタンをクリックしたら表示。
        項目は
        ・書類名（入力）
        ・管理番号（入力）
        ・立案部署（選択）
        ・書類の説明（入力）
        ・カテゴリ（選択）
        ・管理開始版数（入力）
        ・ファイル（選択またはドラッグアンドドロップ）。
    　　保存を押すと登録。（DBと合うように登録者等や、版管理テーブルにも適当なデータを入れる）
        一番下にキャンセル・追加の２つのボタンを配置。
        ・キャンセルはクリックでダイアログ閉じる。
        
    ## ④編集ダイアログ
        ②書類管理詳細の編集ボタンをクリックしたら表示。
        クリックされた行のデータを初期値として各項目に入れる。
            項目は
            ・書類名（入力）
            ・管理番号（入力）
            ・立案部署（選択）
            ・書類の説明（入力）
            ・カテゴリ（選択）
            ・管理開始版数（入力）
            ・ファイル（選択またはドラッグアンドドロップ）。

        一番下にキャンセル・編集、削除の3つのボタンを配置。
        タイトルの誤字を直したり、カテゴリーを編集（修正）したり、ファイルを差し替えたり等、メタデータの編集。版数は変えない。

        ※編集を行った際のrevisionsテーブルについて
        ・ファイルの差し替えを行った場合、revisionsテーブルのfile関連カラム（path,name,type,size）も更新。
        ・ファイルの差し替えの有無問わず、編集したら、revisions.updated_atとrevisions.updated_byも更新。
    　　・revision_number は変わらない。
    　　・編集ボタンをクリックするとダイアログが閉じ、編集データが反映される。
    　　
    　　・キャンセルはクリックでダイアログ閉じる。

    ## ⑤改版ダイアログ
        ②書類管理詳細の改版ボタンをクリックしたら表示。
            項目は
            ・書類名（入力）
            ・管理番号（入力）
            ・立案部署（選択）
            ・書類の説明（入力）
            ・カテゴリ（選択）
            ・管理開始版数（入力）
            ・ファイル（選択またはドラッグアンドドロップ）。

        一番下にキャンセル・改版の二つのボタンを配置。
        内容が改定・更新されたデータや新しくドラッグアンドドロップされたファイルを、revision_number を上げて追加する。
        ※改版の際、ファイルの差し替えが無ければ、同じファイルデータ（path,name,type,size）を引き続き使用。（基本的には差し替えると思うが）
    　　旧版は履歴として残る。
    　　改版ボタンをクリックするとダイアログが閉じ、改版したデータが表示される。
    　　・キャンセルはクリックでダイアログ閉じる。

     ## 削除ダイアログ
        ④編集ダイアログで削除がクリックされたら、本当に削除して良いか再確認させる。
        デザインはほかのダイアログに合わせるように。
        一番下にキャンセル・削除の二つのボタンを配置。
        削除が押されたら、その行に関わるdocuments（書類本体テーブル）、revisions（版テーブル）のデータを論理削除

    ## ⑥管理画面
        ホームのページのショートカット「管理画面」ボタンからとばせる画面。（すでにapp内にmanagementを作成済み）
        画像⑥のように書類管理、管理画面レベルの大項目はアコーディオン、
        書類カテゴリレベルの中項目はタブに分け、Datagridで表示＋新規追加、１行ごとの編集、削除ボタンを追加。
        Datagridのヘッダー項目（表示する項目）はカテゴリidとカテゴリ名のみ。
        登録、編集、削除はダイアログを表示させる。デザインはそれぞれ他ページ、ダイアログと合う感じで統一するように。
        登録、編集の項目はカテゴリ名のみで、キャンセル＋追加または編集ボタンをクリックさせる。
        削除は、”カテゴリ名”を本当に削除していいですか？のダイアログ表示

    ## 備考
　 ・基本的にはデータの登録、修正等は上部で定義しているDBのテーブルに入れていくため、型や項目等はそこを参照するように。
      上部に記載のあるDBのテーブルはすでにsupabase作成済み。
　 ・ デザインは画像優先、項目はこのファイルに書いてある内容優先
   ・ 版を一つ前に戻したり、過去版の閲覧(改版履歴はある)、ダウンロード等は今のところ必要ないと先方から言われているため一旦実装しないが、今後追加する可能性はある。
   ・ 他でも使用するような共通UI（buttonやDatagrid等）はなるべくcomponents/elementsに作成し、管理するようにする。
   ・ 立案部署にはgetAllDivisionsで取得した部署データを使用
   ・ 登録者、編集者、削除者のidにはgetLoginUserで取得したログインユーザーidを使用
   ・ 登録、編集、削除の日付はその時のリアルタイムを取得
   ・ 版は「ver」ではなく「1版,2版」のような感じで管理
   ・ 管理画面は今のところ大項目の「書類管理」、中項目の「書類カテゴリ」のみの為、１つのアコーディオン、１つのタブでこれらを実装してほしい。（今後、大項目はお知らせやカレンダー等の追加予定あり、中項目も大項目ごとに追加される予定。）


        