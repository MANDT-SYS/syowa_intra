"use client";

import * as React from "react";
import { Typography } from "@mui/material";
import ConfirmDialog from "@/components/elements/ConfirmDialog";
import { setCategoryActiveAction } from "@/app/management/actions";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  current: DocumentCategoryWithCount;
  activeFlag: boolean;
};

export default function CategoryStatusDialog({
  open,
  onClose,
  onSaved,
  current,
  activeFlag,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const isReactivation = activeFlag;

  const handleEnter = () => {
    setSubmitting(false);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await setCategoryActiveAction(current.id, activeFlag);
      onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "カテゴリの状態変更に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={isReactivation ? "カテゴリを再有効化" : "カテゴリを使用停止"}
      message={
        isReactivation
          ? `「${current.name}」を有効に戻しますか？`
          : `「${current.name}」を使用停止にしますか？使用停止にすると、新しい書類では選択できなくなります。既存書類のカテゴリ表示は維持されます。`
      }
      confirmLabel={isReactivation ? "再有効化" : "使用停止"}
      loadingConfirmLabel="処理中..."
      loading={submitting}
      transitionProps={{ onEnter: handleEnter }}
    >
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </ConfirmDialog>
  );
}
