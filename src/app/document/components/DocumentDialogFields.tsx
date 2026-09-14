// src/app/document/components/DocumentDialogFields.tsx
"use client";

/**
 * 書類管理ダイアログの共通フォーム部品
 *
 * 役割
 *  - 登録/編集/改版ダイアログで共通する入力項目（書類名・管理番号・立案部署・カテゴリ・
 *    書類説明・管理開始版数・ファイル）をひとつのコンポーネントにまとめる。
 *  - これにより各ダイアログ側は「タイトル」「ボタン」「保存処理」だけに集中できる。
 *
 * 親側との連携
 *  - 入力値は親が useState で持ち、 setter を渡す（制御されたコンポーネント）。
 *  - File は親で File | null として持つ。
 *  - 親がフォーム送信時に FormData に詰め直して Server Action へ渡す。
 */

import * as React from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import ApartmentIcon from "@mui/icons-material/Apartment";
import NotesIcon from "@mui/icons-material/Notes";
import NumbersIcon from "@mui/icons-material/Numbers";
import EditNoteIcon from "@mui/icons-material/EditNote";
import UploadIcon from "@mui/icons-material/UploadFile";
import FileDropZone from "@/components/elements/FileDropZone";
import FormFieldLabel from "@/components/elements/FormFieldLabel";
import FormTextField from "@/components/elements/FormTextField";
import type { DivisionInfo, DocumentCategory } from "@/types/interface";

// 入力フィールドの値
export type DocumentFormValues = {
  title: string;
  managementNumber: string;
  description: string;
  categoryId: number | ""; // "" は未選択
  managementDivisionId: number | ""; // "" は未選択
  managedFromRevisionNumber: number;
  notes: string; // 改版ダイアログでのみ使う
};

type Props = {
  values: DocumentFormValues;
  onChange: <K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) => void;
  // ファイル
  file: File | null;
  onFileChange: (file: File | null) => void;
  // セレクトボックス用の選択肢
  categories: DocumentCategory[];
  currentInactiveCategory?: { id: number; name: string } | null;
  divisions: DivisionInfo[];
  // 表示モード切替
  showNotes?: boolean;           // 改版時のみ true
  fileHelperText?: string;       // ファイル枠の説明
  disabled?: boolean;
};

export default function DocumentDialogFields({
  values,
  onChange,
  file,
  onFileChange,
  categories,
  currentInactiveCategory = null,
  divisions,
  showNotes = false,
  fileHelperText,
  disabled = false,
}: Props) {
  const isCurrentInactiveCategory =
    currentInactiveCategory !== null &&
    values.categoryId === currentInactiveCategory.id &&
    !categories.some((category) => category.id === currentInactiveCategory.id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      

      {/* 管理番号 */}
      <Box>
        <FormFieldLabel icon={<NumbersIcon sx={{ fontSize: 16 }} />}>管理番号（必須）</FormFieldLabel>
        <FormTextField
          value={values.managementNumber}
          onChange={(e) => onChange("managementNumber", e.target.value)}
          placeholder="例: SK-総-30"
          fullWidth
          size="small"
          disabled={disabled}
        />
      </Box>
      {/* 書類名 */}
      <Box>
        <FormFieldLabel icon={<DescriptionIcon sx={{ fontSize: 16 }} />}>書類名（必須）</FormFieldLabel>
        <FormTextField
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="書類名を入力"
          fullWidth
          size="small"
          disabled={disabled}
        />
      </Box>

      {/* カテゴリ */}
      <Box>
        <FormFieldLabel icon={<CategoryIcon sx={{ fontSize: 16 }} />}>カテゴリ（必須）</FormFieldLabel>
        <FormControl fullWidth size="small" disabled={disabled}>
          <Select
            displayEmpty
            value={values.categoryId}
            onChange={(e) => {
              const v = e.target.value;
              onChange("categoryId", Number(v));
         
            }}
            renderValue={(selected) => {
              if (!selected) return <Typography sx={{ color: "#aaa" }}>選択してください</Typography>;
              const c = categories.find((c) => c.id === selected);
              if (c) return c.name;
              if (isCurrentInactiveCategory) return currentInactiveCategory.name;
              return selected;
            }}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {isCurrentInactiveCategory && currentInactiveCategory && (
              <MenuItem value={currentInactiveCategory.id} disabled>
                {currentInactiveCategory.name}（使用停止）
              </MenuItem>
            )}
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 立案部署 */}
      <Box>
        <FormFieldLabel icon={<ApartmentIcon sx={{ fontSize: 16 }} />}>立案部署（必須）</FormFieldLabel>
        <FormControl fullWidth size="small" disabled={disabled}>
          <Select
            displayEmpty
            value={values.managementDivisionId}
            onChange={(e) => {
              const v = e.target.value;
              onChange("managementDivisionId", Number(v));
            }}
            renderValue={(selected) => {
              if (!selected) return <Typography sx={{ color: "#aaa" }}>選択してください</Typography>;
              const d = divisions.find((d) => d.id === selected);
              return d?.divisionName ?? selected;
            }}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {divisions.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.divisionName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 書類説明 */}
      <Box>
        <FormFieldLabel icon={<NotesIcon sx={{ fontSize: 16 }} />}>書類説明</FormFieldLabel>
        <FormTextField
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="説明を入力"
          fullWidth
          multiline
          minRows={2}
          size="small"
          disabled={disabled}
        />
      </Box>

      {/* 管理開始版数 */}
      {!showNotes && (
      <Box>
        <FormFieldLabel icon={<NumbersIcon sx={{ fontSize: 16 }} />}>管理開始版数</FormFieldLabel>
        <FormTextField
          value={values.managedFromRevisionNumber}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange("managedFromRevisionNumber", Number.isFinite(n) && n > 0 ? n : 1);
          }}
          type="number"
          inputProps={{ min: 1, max: 9999, step: 1 }}
          fullWidth
          size="small"
          disabled={disabled}
        />
      </Box>
      )}
      {/* 改版理由（改版ダイアログのみ） */}
      {showNotes && (
        <Box>
          <FormFieldLabel icon={<EditNoteIcon sx={{ fontSize: 16 }} />}>改版内容・理由</FormFieldLabel>
          <FormTextField
            value={values.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="改版の理由を入力"
            fullWidth
            multiline
            minRows={2}
            size="small"
            disabled={disabled}
          />
        </Box>
      )}

      {/* ファイル */}
      <Box>
        <FormFieldLabel icon={<UploadIcon sx={{ fontSize: 16 }} />}>ファイル（必須）</FormFieldLabel>
        <FileDropZone
          file={file}
          onChange={onFileChange}
          helperText={fileHelperText}
        />
      </Box>
    </Box>
  );
}
