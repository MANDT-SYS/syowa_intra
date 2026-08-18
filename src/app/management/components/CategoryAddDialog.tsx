// src/app/management/components/CategoryAddDialog.tsx
"use client";

/**
 * 書類カテゴリ 新規追加ダイアログ
 * - 管理画面 > 書類管理 > 書類カテゴリ > 「+ 新規追加」から開く
 * - 項目はカテゴリ名のみ
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
        新規追加
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        カテゴリ名を入力し、追加ボタンを押してください。
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
