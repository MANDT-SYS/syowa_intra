// src/app/document/components/DocumentEditDialog.tsx
"use client";

/**
 * ④ 書類編集ダイアログ
 * - 詳細ページの「修正」ボタンから開く
 * - 各項目は currentデータ を初期値とする
 * - revision_number は変更しない（編集後も同じ版番号のまま）
 * - 一番下に [削除]（左）／[キャンセル][修正]（右）の3ボタン
 */

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button as MuiButton,
  Box,
} from "@mui/material";
import Button from "@/components/elements/Button";
import DocumentDialogFields, {
  type DocumentFormValues,
} from "@/app/document/components/DocumentDialogFields";
import { editDocumentAction } from "@/app/document/actions";
import { assertFileSize } from "@/lib/fileSize";
import type { DivisionInfo, DocumentCategory, DocumentDetailData } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;          // 編集成功時のコールバック
  onRequestDelete: () => void;  // 「削除」ボタン押下時のコールバック（親で削除ダイアログを開く）
  current: DocumentDetailData;  // 編集対象の現在データ
  categories: DocumentCategory[];
  divisions: DivisionInfo[];
};

export default function DocumentEditDialog({
  open,
  onClose,
  onSaved,
  onRequestDelete,
  current,
  categories,
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

  // current が変わったら値を同期（別書類を開き直したとき）
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

  // ダイアログを開くたびに初期化（同じ書類でも開き直しで状態クリア）
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
      // file 未選択時は append しない（Server側で「差し替えなし」扱い）
      if (file) fd.append("file", file);

      await editDocumentAction(fd);
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "更新に失敗しました。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
        修正
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        内容を変更し、修正ボタンを押してください。
      </Typography>

      <DialogContent sx={{ pt: 2 }}>
        <DocumentDialogFields
          values={values}
          onChange={handleChange}
          file={file}
          onFileChange={setFile}
          categories={categories}
          divisions={divisions}
          disabled={submitting}
          fileHelperText={"ファイルの変更がある場合のみ、\n新しいファイルをドラッグ＆ドロップ"}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      {/* 左に削除、右にキャンセル/修正 */}
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <MuiButton
          variant="outlined"
          color="error"
          onClick={onRequestDelete}
          disabled={submitting}
          sx={{ borderRadius: 2 }}
        >
          削除
        </MuiButton>
        <Box sx={{ display: "flex", gap: 1 }}>
          <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
            キャンセル
          </MuiButton>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "修正中..." : "修正"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
