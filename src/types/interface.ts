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
    user_id: number;//ユーザーID
    family_name: string;//姓
    given_name: string;//名
    accountancy_authority_id: number;//権限ID
    employment_status_id: number;//雇用形態ID
    division_id: number;//部門ID
  };

  //認証コンテキスト
  export type AuthContext = {
    sub: string;//id
    user: UserInfo;//ユーザー情報
  };