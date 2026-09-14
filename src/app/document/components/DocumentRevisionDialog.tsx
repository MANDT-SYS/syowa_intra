// src/app/document/components/DocumentRevisionDialog.tsx
"use client";

/**
 * ⑤ 書類改版ダイアログ
 * - 詳細ページの「改版」ボタンから開く
 * - 各項目は current の値を初期値とする
 * - 必須項目はそのままだが、ファイルは差し替え任意（差し替え無しなら前版を継承）
 * - revision_number は server 側で +1 される
 */

import * as React from "react";
import {
  Typography,
  Button as MuiButton,
} from "@mui/material";
import Button from "@/components/elements/Button";
import CommonDialog from "@/components/elements/CommonDialog";
import DocumentDialogFields, {
  type DocumentFormValues,
} from "@/app/document/components/DocumentDialogFields";
import { reviseDocumentAction } from "@/app/document/actions";
import { assertFileSize } from "@/lib/fileSize";
import type { DivisionInfo, DocumentCategory, DocumentDetailData } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  current: DocumentDetailData;
  categories: DocumentCategory[];
  currentInactiveCategory?: { id: number; name: string } | null;
  divisions: DivisionInfo[];
};

export default function DocumentRevisionDialog({
  open,
  onClose,
  onSaved,
  current,
  categories,
  currentInactiveCategory,
  divisions,
}: Props) {
  const [values, setValues] = React.useState<DocumentFormValues>({
    title: current.title,
    managementNumber: current.management_number,
    description: current.description ?? "",
    categoryId: current.category_id ?? "",
    managementDivisionId: current.management_division_id,
    managedFromRevisionNumber: current.managed_from_revision_number,
    notes: "",
  });
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  // current が変わったら同期
  const [prevId, setPrevId] = React.useState(current.id);
  if (prevId !== current.id) {
    setPrevId(current.id);
    setValues({
      title: current.title,
      managementNumber: current.management_number,
      description: current.description ?? "",
      categoryId: current.category_id ?? "",
      managementDivisionId: current.management_division_id,
      managedFromRevisionNumber: current.managed_from_revision_number,
      notes: "",
    });
    setFile(null);
    setError("");
  }

  // ダイアログが開くたびに初期化
  const handleEnter = () => {
    setValues({
      title: current.title,
      managementNumber: current.management_number,
      description: current.description ?? "",
      categoryId: current.category_id ?? "",
      managementDivisionId: current.management_division_id,
      managedFromRevisionNumber: current.managed_from_revision_number,
      notes: "",
    });
    setFile(null);
    setError("");
    setSubmitting(false);
  };

  const handleChange = <K extends keyof DocumentFormValues>(
    key: K,
    value: DocumentFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!values.title.trim()) return setError("書類名を入力してください。");
    if (!values.managementNumber.trim()) return setError("管理番号を入力してください。");
    if (!values.categoryId) return setError("カテゴリを選択してください。");
    if (!values.managementDivisionId) return setError("立案部署を選択してください。");

    if (file) {
      try {
        assertFileSize(file);
      } catch (error) {
        return setError(error instanceof Error ? error.message : "ファイルは50MB以下にしてください。");
      }
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("documentId", String(current.id));
      fd.append("title", values.title);
      fd.append("managementNumber", values.managementNumber);
      fd.append("description", values.description);
      fd.append("categoryId", String(values.categoryId));
      fd.append("managementDivisionId", String(values.managementDivisionId));
      fd.append("managedFromRevisionNumber", String(values.managedFromRevisionNumber));
      fd.append("notes", values.notes);
      if (file) fd.append("file", file);

      await reviseDocumentAction(fd);
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "改版に失敗しました。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      transitionProps={{ onEnter: handleEnter }}
      title="改版"
      description="改版内容を入力し、改版ボタンを押してください。"
      actions={
        <>
          <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
            キャンセル
          </MuiButton>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "改版中..." : "改版"}
          </Button>
        </>
      }
    >
        <DocumentDialogFields
          values={values}
          onChange={handleChange}
          file={file}
          onFileChange={setFile}
          categories={categories}
          currentInactiveCategory={currentInactiveCategory}
          divisions={divisions}
          showNotes
          disabled={submitting}
          fileHelperText={"ファイルの更新がある場合のみ、\n新しいファイルをドラッグ＆ドロップ"}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
    </CommonDialog>
  );
}
