import "server-only";

/**
 * 外部ユーザーAPIの UserInfo.userId を検証する。
 * 負数を含む signed safe integer を許可する。0 の特別扱いは呼び出し側で行う。
 */
export const parseExternalUserId = (
  value: unknown,
  fieldName = "ユーザーID"
): number => {
  if (typeof value === "string") {
    if (!/^(?:0|-?[1-9][0-9]*)$/.test(value)) {
      throw new Error(`${fieldName}が不正です。`);
    }

    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  } else if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value;
  }

  throw new Error(`${fieldName}が不正です。`);
};
