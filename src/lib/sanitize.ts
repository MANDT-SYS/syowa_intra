/**
 * サーバーサイド専用のテキストサニタイズ（無害化）＆バリデーション用ユーティリティ。
 * - 型チェック・必須/最大長バリデーション・HTMLタグ除去を行う
 * - サニタイズ失敗時はエラーメッセージ付きで throw
 */

import "server-only";// クライアントからは使用不可

// オプションの型定義
type SanitizeOptions = {
  maxLength?: number;       // 最大文字数（デフォルト100）
  fieldName?: string;       // エラーメッセージ用のフィールド名
  allowEmpty?: boolean;     // 空を許可するか（デフォルトfalse）
};

/**
 * テキスト入力値をサニタイズ＆バリデーションする
 * @param value 任意の入力値
 * @param options 検証やエラー文言のオプション
 * @returns サニタイズ済み文字列
 * @throws 不正時はエラー
 */
export const sanitizeText = (
  value: unknown,
  options: SanitizeOptions = {}
): string => {
  const {
    maxLength = 100,
    fieldName = "入力値",
    allowEmpty = false,
  } = options;

  // 1. 型チェック
  if (typeof value !== 'string') {
    throw new Error(`${fieldName}が不正です。`);
  }

  const trimmed = value.trim();

  // 2. 空チェック
  if (!allowEmpty && !trimmed) {
    throw new Error(`${fieldName}は必須です。`);
  }

  // 3. 長さチェック
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName}は${maxLength}文字以内で入力してください。`);
  }

  // 4. HTMLタグ除去（完全無効化）
  const sanitized = trimmed.replace(/<[^>]*>/g, '');

  // 5. サニタイズ後の空チェック
  if (!allowEmpty && !sanitized) {
    throw new Error(`${fieldName}に不正な文字が含まれています。`);
  }

  return sanitized;
};