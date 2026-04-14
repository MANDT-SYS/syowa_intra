
# カレンダー機能概要・ルール
    ## DBテーブル
    create table calendar (
    id uuid primary key default gen_random_uuid(),
    year smallint not null unique,
    title text not null,
    storage_path text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
    );

    ## Supabase Storage
    - バケット名: `calendars`
    - ファイルパス規則: `calendars/{year}.pdf`（例: `calendars/2026.pdf`）
    

    ## 画面レイアウト
    - ヘッダー行: 年セレクトボックス（左）+ 編集ボタン（右）
    - その下にタイトルをテキスト表示
    - その下にPDFビューアーを表示（iframe使用、画面幅は上下左右に少し空白あり）

    ## 表示機能
    - ページ遷移時にcalendarテーブルの全レコードを取得する
    - セレクトボックスには取得した年を降順で表示する
    - 初期選択は最新年（yearが最大のレコード）
    - 選択中の年に対応するタイトルとPDFを表示する
    - セレクトボックスの値を変更したら、表示をその年のデータに切り替える（再fetchは不要、初回取得データから参照）
    - PDFのURLはstorage_pathからSupabase Storageの公開URL or Signed URLを生成して使用する

    ## 編集機能（モーダルダイアログ）
    - 編集ボタン押下でダイアログを開く
    - ダイアログには以下のフィールドを表示する:
        - 年（数値入力 / 既存データの場合は変更不可）
        - タイトル（テキスト入力）
        - PDFファイル（ファイル選択、差し替え時のみ選択）
        - キャンセル、保存ボタンを設置
    - 操作:
        - 新規追加: 年・タイトル・PDFをすべて入力して保存
        - 既存編集: セレクトボックスで選択中の年のデータを編集
        - 削除: 選択中の年のデータを削除（確認ダイアログを挟む）
    - 保存後はデータを再取得してセレクトボックスとPDF表示を更新する
    - 年の重複は不可（unique制約によりDBレベルで弾く + フロントでもバリデーション）