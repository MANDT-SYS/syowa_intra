// src/app/management/components/CategoryEditDialog.tsx
"use client";

/**
 * 書類カテゴリ 編集ダイアログ
 * - 各行の編集アイコンから開く
 * - 初期値は対象カテゴリ名
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
import { editCategoryAction } from "@/app/management/actions";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  current: DocumentCategoryWithCount;
};

export default function CategoryEditDialog({ open, onClose, onSaved, current }: Props) {
  const [name, setName] = React.useState(current.name);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  // 別カテゴリで開き直したら同期
  const [prevId, setPrevId] = React.useState(current.id);
  if (prevId !== current.id) {
    setPrevId(current.id);
    setName(current.name);
    setError("");
  }

  // 同じカテゴリでも開き直しのたびに初期化
  const handleEnter = () => {
    setName(current.name);
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
      await editCategoryAction(current.id, name.trim());
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
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      transitionProps={{ onEnter: handleEnter }}
      title="編集"
      description="内容を変更し、編集ボタンを押してください。"
      actions={
        <>
          <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
            キャンセル
          </MuiButton>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "更新中..." : "編集"}
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
