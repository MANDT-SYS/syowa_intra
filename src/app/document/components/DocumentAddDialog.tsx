// src/app/document/components/DocumentAddDialog.tsx
"use client";

/**
 * ③ 書類の新規追加ダイアログ
 * - 書類管理トップの「+ 新規追加」ボタンから開く
 * - すべての入力が必須（ファイルも必須）
 * - 追加に成功したらダイアログを閉じ、親（DocumentApp）が router.refresh で再取得
 */

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import Button from "@/components/elements/Button";
import DocumentDialogFields, {
  type DocumentFormValues,
} from "@/app/document/components/DocumentDialogFields";
import { addDocumentAction } from "@/app/document/actions";
import { assertFileSize } from "@/lib/fileSize";
import type { DivisionInfo, DocumentCategory } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void; // 保存成功時のコールバック（親で再取得）
  categories: DocumentCategory[];
  divisions: DivisionInfo[];
};

// 入力値の初期状態
const initialValues: DocumentFormValues = {
  title: "",
  managementNumber: "",
  description: "",
  categoryId: "",
  managementDivisionId: "",
  managedFromRevisionNumber: 1,
  notes: "",
};

export default function DocumentAddDialog({
  open,
  onClose,
  onSaved,
  categories,
  divisions,
}: Props) {
  const [values, setValues] = React.useState<DocumentFormValues>(initialValues);
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  // ダイアログを開くたびにフォーム初期化
  const handleEnter = () => {
    setValues(initialValues);
    setFile(null);
    setError("");
    setSubmitting(false);
  };

  // 入力値変更時のハンドラ（型安全に分配）
  const handleChange = <K extends keyof DocumentFormValues>(
    key: K,
    value: DocumentFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // 「追加」ボタン押下
  const handleSubmit = async () => {
    setError("");

    // 入力チェック（最低限ここでもバリデーション）
    if (!values.title.trim()) return setError("書類名を入力してください。");
    if (!values.managementNumber.trim()) return setError("管理番号を入力してください。");
    if (!values.categoryId) return setError("カテゴリを選択してください。");
    if (!values.managementDivisionId) return setError("立案部署を選択してください。");
    if (!file) return setError("ファイルを選択してください。");

    if (file) {
      try {
        assertFileSize(file);
      } catch (error) {
        return setError(error instanceof Error ? error.message : "ファイルは50MB以下にしてください。");
      }
    }

    setSubmitting(true);
    try {
      // FormData に詰めて Server Action へ
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("managementNumber", values.managementNumber);
      fd.append("description", values.description);
      fd.append("categoryId", String(values.categoryId));
      fd.append("managementDivisionId", String(values.managementDivisionId));
      fd.append("managedFromRevisionNumber", String(values.managedFromRevisionNumber));
      fd.append("file", file);

      await addDocumentAction(fd);
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "登録に失敗しました。";
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
        新規追加
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        内容を入力し、追加ボタンを押してください。
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
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end", gap: 1 }}>
        <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
          キャンセル
        </MuiButton>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "追加中..." : "追加"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
