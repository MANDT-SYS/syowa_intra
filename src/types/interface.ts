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
  
  export type HeaderUserInfo = {
    name: string;
    authorityId: number;
    employmentStatusId: number;
    divisionId: number;
  };