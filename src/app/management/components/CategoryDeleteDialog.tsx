// src/app/management/components/CategoryDeleteDialog.tsx
"use client";

/**
 * 書類カテゴリ 削除確認ダイアログ
 * - 各行の削除アイコンから開く
 * - 「"カテゴリ名"を本当に削除していいですか？」表示
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
import { removeCategoryAction } from "@/app/management/actions";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  current: DocumentCategoryWithCount;
};

export default function CategoryDeleteDialog({ open, onClose, onDeleted, current }: Props) {
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
      const res = await removeCategoryAction(current.id);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onDeleted();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "削除に失敗しました。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
        削除
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        「{current.name}」を本当に削除していいですか？
      </Typography>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="caption" sx={{ color: "#888780" }}>
          ※ このカテゴリを使用中の書類は「カテゴリ無し」として残ります。
          {current.document_count > 0 && `（${current.document_count} 件）`}
        </Typography>

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
        <Button onClick={handleDelete} disabled={submitting}>
          {submitting ? "削除中..." : "削除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
