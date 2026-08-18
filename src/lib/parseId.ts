import "server-only";

export const parsePositiveSafeInteger = (
  value: unknown,
  fieldName = "ID"
): number => {
  if (typeof value === "string") {
    if (!/^[1-9][0-9]*$/.test(value)) {
      throw new Error(`${fieldName}が不正です。`);
    }

    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  } else if (typeof value === "number" && Number.isSafeInteger(value) && value >= 1) {
    return value;
  }

  throw new Error(`${fieldName}が不正です。`);
};
