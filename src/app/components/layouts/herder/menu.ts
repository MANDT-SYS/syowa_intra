import type { HeaderAppItem, HeaderMenuItem, HeaderUserInfo } from "@/types/interface";
import { ConstList } from "../../../../../utils/ConstList";

  export function buildHeaderMenu(user: HeaderUserInfo): HeaderMenuItem[] {

    const items: HeaderMenuItem[] = [];
  
    //メニュー項目を作成
    //開発者権限の場合
    if (user.authorityId === ConstList.DEVELORER_AUTHORITY) {
      return [
        { label: "ホーム", href: "/home", iconKey: "home" },
        { label: "マイページ", href: "/my_page", iconKey: "account" },
        { label: "設定", href: "/setting", iconKey: "settings" },
      ];
    }
  
    //一般権限の場合
    items.push({ label: "ホーム", href: "/home", iconKey: "home" });
    items.push({ label: "マイページ", href: "/my_page", iconKey: "account" });
    items.push({ label: "設定", href: "/setting", iconKey: "settings" });
  
    return items;
  }
  
  //アプリリンクを作成
  export function buildAppLinks(): HeaderAppItem[] {
    return [
      {
        label: "外注費管理",
        iconSrc: "/images/subcontract_icon.png",
        href: "https://system.syowa.com/subcontracting_cost/home",
      },
      {
        label: "安全衛生",
        iconSrc: "/images/Has_icon.png",
        href: "https://system2.syowa.com/Health-and-safety/home",
      },
      {
        label: "不適合管理",
        iconSrc: "/images/nonconformity_icon.png",
        href: "https://system2.syowa.com/nonconformity_management/home",
      },
      {
        label: "社有車予約",
        iconSrc: "/images/garage_icon.png",
        href: "https://system2.syowa.com/garage_management/home",
      },
      {
        label: "マスター管理",
        iconSrc: "/images/master_icon.png",
        href: "https://system.syowa.com/master_management/home",
      },
    ];
  }
  
  export { ConstList };