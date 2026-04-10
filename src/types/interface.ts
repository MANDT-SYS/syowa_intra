export interface Todo {
    id: number
    title: string
}

//ヘッダー
export type HeaderMenuItem = {
    label: string;
    href: string;
    iconKey: string;
  };
  
  export type HeaderAppItem = {
    label: string;
    href: string;
    iconSrc: string;
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

  export type AuthContext = {
    sub: string;
    user: UserInfo;
  };