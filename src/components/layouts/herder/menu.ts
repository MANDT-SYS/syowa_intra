import type { HeaderAppItem, HeaderMenuItem } from "@/types/interface";

export function buildHeaderMenu(canAccessManagement: boolean): HeaderMenuItem[] {
  const items: HeaderMenuItem[] = [
    { label: "ホーム", href: "/home", iconKey: "home" },
    { label: "設定", href: "/setting", iconKey: "settings" },
  ];

  if (canAccessManagement) {
    items.push({ label: "管理画面", href: "/management", iconKey: "settings" });
  }

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
