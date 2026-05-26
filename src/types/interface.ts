//TODO
export interface Todo {
    id: number//TODOID
    title: string//TODOタイトル
}

//カレンダー
export interface CalendarRecord {
    id: string//カレンダーID
    year: number//年
    title: string//タイトル
    storage_path: string//ストレージパス
    created_at: string//作成日時
    updated_at: string//更新日時
}

//ヘッダー
export type HeaderMenuItem = {
    label: string;//ヘッダー項目名
    href: string;//ヘッダー項目リンク
    iconKey: string;//ヘッダー項目アイコンキー
  };
  
  export type HeaderAppItem = {
    label: string;//ヘッダー項目名
    href: string;//ヘッダー項目リンク
    iconSrc: string;//ヘッダー項目アイコン
  };
  
  //ユーザー情報
  export type UserInfo = {
    userId: number;//ユーザーID
    familyName: string;//姓
    givenName: string;//名
    accountancyAuthorityId: number;//権限ID
    employmentStatusId: number;//雇用形態ID
    divisionId: number;//部門ID
  };

  //認証コンテキスト
  export type AuthContext = {
    sub: string;//id
    user: UserInfo;//ユーザー情報
  };

  // ============================================================
  // 部署情報（外部APIから返却される部署マスタの型）
  // ※ getAllDivisions() の戻り値1要素分
  // ============================================================
  export type DivisionInfo = {
    id: number;   // 部署ID
    divisionName: string; // 部署名
  };

  // ============================================================
  // 書類カテゴリ（document_categoriesテーブル）
  // ============================================================
  export type DocumentCategory = {
    id: number;            // BIGSERIAL（1, 2, 3...）
    name: string;          // カテゴリ名
    display_order: number; // 表示順
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
    deleted_at: string | null;
    deleted_by: number | null;
  };

  // 管理画面のグリッドで使う「件数つきカテゴリ」型
  export type DocumentCategoryWithCount = DocumentCategory & {
    document_count: number; // このカテゴリを使っている書類件数（論理削除されてない物のみ）
  };

  // ============================================================
  // 書類本体（documentsテーブル）
  // ============================================================
  export type DocumentRecord = {
    id: number;                          // BIGSERIAL
    title: string;                       // 書類タイトル
    management_number: string;           // 管理番号
    description: string | null;          // 書類の説明
    category_id: number | null;          // カテゴリID
    management_division_id: number;      // 立案部署ID
    managed_from_revision_number: number; // 管理開始版数
    current_revision_id: number | null;  // 最新版ID
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
    deleted_at: string | null;
    deleted_by: number | null;
  };

  // ============================================================
  // 版（revisionsテーブル）
  // ============================================================
  export type RevisionRecord = {
    id: number;                  // BIGSERIAL
    document_id: number;         // 親書類ID
    revision_number: number;     // 版番号（1,2,3...）
    file_path: string;           // Supabase Storage上のパス
    file_name: string;           // 元のファイル名
    file_type: DocumentFileType; // pdf / xlsx / word / image
    file_size: number;           // バイト数
    notes: string | null;        // 改版メモ
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
    deleted_at: string | null;
    deleted_by: number | null;
  };

  // 一覧表示用：documents + 最新revision + categoryをまとめた行型
  export type DocumentListRow = {
    id: number;
    title: string;
    management_number: string;
    description: string | null;
    category_id: number | null;
    category_name: string | null;    // カテゴリ名（無ければ null）
    management_division_id: number;
    division_name: string | null;    // 部署名（外部APIで紐付け）
    managed_from_revision_number: number;
    current_revision_number: number | null; // 最新版番号
    current_revision_id: number | null;
    file_url: string | null;         // 最新版ファイルの公開URL
    file_name: string | null;
    file_type: DocumentFileType | null;
    created_at: string;              // 登録日
    revised_at: string | null;       // 最新版のcreated_at（改版日）
  };

  // 詳細表示用：上記 + 全版履歴
  export type DocumentDetailData = DocumentListRow & {
    revisions: RevisionRecord[];     // 改版履歴（新しい順）
  };

  // 書類ファイルの種別（StorageのcontentTypeやプレビュー方法の分岐に使う）
  export type DocumentFileType = "pdf" | "xlsx" | "word" | "image";