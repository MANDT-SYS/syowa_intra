"use client";

/**
 * 書類カテゴリ 編集ダイアログ
 * - 各行の編集アイコンから開く
 * - 初期値は対象カテゴリ名
 */

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button as MuiButton,
  Box,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import Button from "@/components/elements/Button";
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
        編集
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        内容を変更し、編集ボタンを押してください。
      </Typography>

      <DialogContent sx={{ pt: 2 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#86171F", fontWeight: 600, mb: 0.5 }}
          >
            <CategoryIcon sx={{ fontSize: 16 }} />
            カテゴリ名
          </Typography>
          <TextField
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end", gap: 1 }}>
        <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
          キャンセル
        </MuiButton>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "更新中..." : "編集"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
