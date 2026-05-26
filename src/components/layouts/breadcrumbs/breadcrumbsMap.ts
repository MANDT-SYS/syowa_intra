// パスセグメント（URLの一部分）→ 表示ラベルの変換マップ
// 例: /document/test → "ホーム / 書類管理 / テスト"
export const breadcrumbsLabelMap: Record<string, string> = {
    home: "ホーム",
    document: "書類管理",
    test: "テスト",
    calendar: "カレンダー",
    management: "管理画面",
    my_page: "マイページ",
    setting: "設定",
  };