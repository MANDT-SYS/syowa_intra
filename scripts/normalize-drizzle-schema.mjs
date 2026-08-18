import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const schemaPath = resolve("src/db/schema.ts");

// PostgreSQLではBIGINT / BIGSERIALのまま保持し、昭和イントラの既存公開型と
// 外部ユーザーAPIのUserInfo.userIdに合わせてTypeScriptではnumberとして扱う列だけを列挙する。
const numberModeColumns = new Map([
  ["document_categories", new Set(["id", "created_by", "updated_by", "deleted_by"])],
  [
    "documents",
    new Set([
      "id",
      "category_id",
      "management_division_id",
      "current_revision_id",
      "created_by",
      "updated_by",
      "deleted_by",
    ]),
  ],
  [
    "revisions",
    new Set([
      "id",
      "document_id",
      "file_size",
      "created_by",
      "updated_by",
      "deleted_by",
    ]),
  ],
  [
    "authority_master",
    new Set(["authority_id", "created_by", "updated_by", "deleted_by"]),
  ],
  [
    "authority_user",
    new Set([
      "authority_user_id",
      "authority_id",
      "user_id",
      "created_by",
      "updated_by",
      "deleted_by",
    ]),
  ],
]);

const source = await readFile(schemaPath, "utf8");
const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
const foundColumns = new Set();
let currentTable;
let changes = 0;

const normalized = source
  .split(/\r?\n/)
  .map((line) => {
    const tableMatch = line.match(/^export const \w+ = pgTable\("([^"]+)", \{$/);
    if (tableMatch) {
      currentTable = tableMatch[1];
      return line;
    }

    const columnMatch = line.match(/^(\s*\w+:\s*)(bigint|bigserial)\((.*)\)(.*)$/);
    if (!currentTable || !columnMatch) {
      return line;
    }

    const [, prefix, builder, argumentsText, suffix] = columnMatch;
    const explicitColumnName = argumentsText.match(/^\s*"([^"]+)"/);
    const propertyName = prefix.match(/\s*(\w+):/)?.[1];
    const columnName = explicitColumnName?.[1] ?? propertyName;

    if (!columnName || !numberModeColumns.get(currentTable)?.has(columnName)) {
      return line;
    }

    foundColumns.add(`${currentTable}.${columnName}`);

    if (/mode:\s*["']number["']/.test(argumentsText)) {
      return line;
    }

    let normalizedArguments;
    if (/mode:\s*["']bigint["']/.test(argumentsText)) {
      normalizedArguments = argumentsText.replace(/mode:\s*["']bigint["']/, 'mode: "number"');
    } else if (builder === "bigserial" && argumentsText.trim() === "") {
      normalizedArguments = '{ mode: "number" }';
    } else if (builder === "bigint" && /^\s*"[^"]+"\s*$/.test(argumentsText)) {
      normalizedArguments = `${argumentsText}, { mode: "number" }`;
    } else {
      throw new Error(`number modeを安全に補正できない列です: ${currentTable}.${columnName}`);
    }

    changes += 1;
    return `${prefix}${builder}(${normalizedArguments})${suffix}`;
  })
  .join(lineEnding);

const expectedColumns = [...numberModeColumns.entries()].flatMap(([table, columns]) =>
  [...columns].map((column) => `${table}.${column}`),
);
const missingColumns = expectedColumns.filter((column) => !foundColumns.has(column));

if (missingColumns.length > 0) {
  throw new Error(`schema.tsにallowlist対象列がありません: ${missingColumns.join(", ")}`);
}

if (normalized !== source) {
  await writeFile(schemaPath, normalized, "utf8");
}

console.info(`Normalized Drizzle number mappings: ${changes} changed, ${expectedColumns.length} allowlisted.`);
