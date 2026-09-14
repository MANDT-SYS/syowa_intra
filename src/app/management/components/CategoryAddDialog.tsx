// src/app/management/components/CategoryAddDialog.tsx
"use client";

/**
 * 書類カテゴリ 新規追加ダイアログ
 * - 管理画面 > 書類管理 > 書類カテゴリ > 「+ 新規追加」から開く
 * - 項目はカテゴリ名のみ
 */

import * as React from "react";
import {
  Typography,
  Button as MuiButton,
  Box,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import Button from "@/components/elements/Button";
import CommonDialog from "@/components/elements/CommonDialog";
import FormFieldLabel from "@/components/elements/FormFieldLabel";
import FormTextField from "@/components/elements/FormTextField";
import { addCategoryAction } from "@/app/management/actions";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function CategoryAddDialog({ open, onClose, onSaved }: Props) {
  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  // ダイアログ開いた時の初期化
  const handleEnter = () => {
    setName("");
    setError("");
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("カテゴリ名を入力してください。");
      return;
    }
    setSubmitting(true);
    try {
      await addCategoryAction(name.trim());
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "追加に失敗しました。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      transitionProps={{ onEnter: handleEnter }}
      title="新規追加"
      description="カテゴリ名を入力し、追加ボタンを押してください。"
      actions={
        <>
          <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
            キャンセル
          </MuiButton>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "追加中..." : "追加"}
          </Button>
        </>
      }
    >
        <Box>
          <FormFieldLabel icon={<CategoryIcon sx={{ fontSize: 16 }} />}>
            カテゴリ名
          </FormFieldLabel>
          <FormTextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="カテゴリ名を入力"
            fullWidth
            size="small"
            disabled={submitting}
          />
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
    </CommonDialog>
  );
}
