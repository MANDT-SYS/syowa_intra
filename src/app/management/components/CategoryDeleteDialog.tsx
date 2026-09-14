"use client";

import * as React from "react";
import { Typography } from "@mui/material";
import ConfirmDialog from "@/components/elements/ConfirmDialog";
import { removeCategoryAction } from "@/app/management/actions";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  current: DocumentCategoryWithCount;
};

export default function CategoryDeleteDialog({
  open,
  onClose,
  onDeleted,
  current,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleEnter = () => {
    setError("");
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setError("");
    setSubmitting(true);
    try {
      const result = await removeCategoryAction(current.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onDeleted();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "カテゴリの削除に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      title="カテゴリを削除"
      message={`「${current.name}」を論理削除しますか？`}
      confirmLabel="削除"
      loadingConfirmLabel="削除中..."
      loading={submitting}
      transitionProps={{ onEnter: handleEnter }}
    >
      <Typography variant="caption" sx={{ display: "block", color: "#888780" }}>
        使用中の書類があるカテゴリは削除できません。削除しても既存の書類カテゴリを変更することはありません。
      </Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </ConfirmDialog>
  );
}
