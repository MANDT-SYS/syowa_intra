
# 書類管理機能概要・ルール
    DBテーブル
    下記のように作成。

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

            -- カテゴリーの登録者（user_id）
            created_by BIGINT NOT NULL,

            -- 論理削除日時（NULLなら有効、値があれば無効化済み）
            deleted_at TIMESTAMPTZ,

            -- 論理削除実行者（user_id）
            created_by BIGINT
        );

        -- テーブルコメント
        COMMENT ON TABLE document_categories IS '書類カテゴリーのマスタテーブル。セレクトボックスの選択肢を管理。';

        -- カラムコメント
        COMMENT ON COLUMN document_categories.id IS '主キー（UUID自動生成）';
        COMMENT ON COLUMN document_categories.name IS 'カテゴリー名（ユニーク制約あり）';
        COMMENT ON COLUMN document_categories.display_order IS 'セレクトボックスでの表示順（昇順）';
        COMMENT ON COLUMN document_categories.created_at IS '登録日時';
        COMMENT ON COLUMN document_categories.created_by IS '登録者（user_id）';
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

            -- カテゴリーID（document_categoriesテーブルへの外部キー）
            -- カテゴリーが削除されてもドキュメントは残すためSET NULL
            category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,

            -- 部署名（この書類を管轄する部署）
            department TEXT NOT NULL,

            -- 最新版のrevision ID（revisionsテーブルへの外部キー）
            -- 一覧画面では、この参照先のrevisionを表示する
            -- ※ revisionsテーブル作成後に外部キー制約を追加する（循環参照回避）
            current_revision_id UUID,

            -- ドキュメントの初回登録日時（自動設定）
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- ドキュメントの初回登録者（user_id）
            created_by BIGINT NOT NULL,

            -- 論理削除日時（NULLなら未削除、値があれば削除済み）
            deleted_at TIMESTAMPTZ,

            -- 論理削除を実行したユーザー（user_id）
            deleted_by BIGINT
        );

        -- テーブルコメント
        COMMENT ON TABLE documents IS '書類フォーマットの本体テーブル。1書類につき1レコード。';

        -- カラムコメント
        COMMENT ON COLUMN documents.id IS '主キー（UUID自動生成）';
        COMMENT ON COLUMN documents.title IS '書類タイトル';
        COMMENT ON COLUMN documents.category_id IS 'カテゴリーID（FK → document_categories.id）';
        COMMENT ON COLUMN documents.department IS '管轄部署名';
        COMMENT ON COLUMN documents.current_revision_id IS '最新版のrevision ID。一覧表示に使用';
        COMMENT ON COLUMN documents.created_at IS '初回登録日時';
        COMMENT ON COLUMN documents.created_by IS '初回登録者（user_id）';
        COMMENT ON COLUMN documents.deleted_at IS '論理削除日時（NULLなら有効）';
        COMMENT ON COLUMN documents.deleted_by IS '論理削除実行者（user_id）';


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

            -- 改版内容・理由（変更内容や改版理由を記録）
            -- 初版の場合はNULL可
            notes TEXT,

            -- この版の登録日時 = 改版日時（自動設定）
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            -- この版の登録者 = 改版者（user_id）
            created_by BIGINT NOT NULL,

            -- 版単位の論理削除日時（通常はdocument単位で削除するが、個別版の削除にも対応）
            deleted_at TIMESTAMPTZ,

            -- 版単位の論理削除実行者（user_id）
            deleted_by BIGINT REFERENCES ,

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
        CREATE INDEX idx_documents_department
            ON documents (department);

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

    ## 画面レイアウト
    　大体のイメージは添付画像を参考にお願い。
    色が青のところは'#86171F'に変更して。
  

    ## 1.書類リスト表示画面
    - ページ遷移時にdocumentsテーブルの全データを取得する（削除済みデータは除く）
    - 取得したデータをリスト表の中に入れる。（新規追加ボタンの下に配置）
    　※１番新しい版のデータを入れる。
      - カラムは
      　・詳細ボタン
      　・ダウンロードボタン
      　・書類タイトル
        ・カテゴリー名（document_categoriesテーブル内idとdocumentテーブル内category_idと同じもののカテゴリー名を表示
        　（比較の際は一応ナンバー型に変換してから行う。））
        ・部署
        ・登録日付
        ・改版日付
        ・登録者名（app/document/page.tsx内で取得したallUsersとdocumentテーブル内created_byと同じもののユーザー名を表示
        　（比較の際は一応ナンバー型に変換してから行う。））
        ・改版者名
    - リスト表の上に検索、フィルター、新規追加ボタンを配置。

    
    ## 2.新規追加ボタンクリック機能
    - 新規追加ボタンをクリックしたら登録ダイアログを表示。
    　書類名、書類の説明の入力、カテゴリの選択等、ファイルの選択（ドラッグアンドドロップ）、メタデータの入力。
    　保存を押すと登録。
        
    ## 3.詳細ボタンクリック機能
    - 書類リスト表示画面リストの各行に存在する詳細ボタンをクリックしたらページ遷移。（app routerの動的ルーティング）
        /documents              ← リスト表ページ
        /documents/[id]         ← 詳細ページ
    
        詳細ページでは下記を表示
        ・ファイルのプレビュー
        ・メタ情報
        ・改版履歴（日付、改版者）
        ・ダウンロードボタン（一覧にもあるが、プレビューを見て確認してからダウンロードしたい場合、詳細画面にもあった方が親切。）
        　配置場所はプレビューの上
        ・改版ボタン
        ・修正ボタン

        改版ボタン、修正ボタン はクリックするとダイアログを表示させる。

        改版ダイアログ：一番下にキャンセル・改版の二つのボタンを配置。
        　　　　　　　　内容が改定・更新されたデータや新しくドラッグアンドドロップされたファイルを、revision_number を上げて追加する。
        　　　　　　　　※改版の際、ドラッグアンドドロップされたファイルが無ければ、同じファイルを引き続き使用。
        　　　　　　　　旧版は履歴として残る。
        　　　　　　　　改版ボタンをクリックするとダイアログが閉じ、改版したデータが表示される。
    　　　　　　　　　　キャンセルはクリックでダイアログ閉じる。
        
        修正ダイアログ：一番下にキャンセル・修正、削除の3つのボタンを配置。
        　　　　　　　　タイトルの誤字を直したり、カテゴリーを変更したり、ファイルを差し替えたり等、メタデータの編集。
        　　　　　　　　revision_number は変わらない。
        　　　　　　　　修正ボタンをクリックするとダイアログが閉じ、変更データが反映される。
        　　　　　　　　削除ボタンはクリックしたら
        　　　　　　　　　　・本当に削除して良いか？
        　　　　　　　　　　・もし改版履歴あれば、改版の履歴があるデータだけど良いか？
        　　　　　　　　の確認を行わせ、OKが押されたら、
        　　　　　　　　documents（書類本体テーブル）、revisions（版テーブル）のデータを論理削除
　　　　　　　　　　　　キャンセルはクリックでダイアログ閉じる。

    ## 備考
    版を一つ前に戻したり、過去版の閲覧、ダウンロード等は今のところ必要ないと先方から言われているため一旦実装しないが、今後追加する可能性はある。
        