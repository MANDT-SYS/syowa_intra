// src/app/document/components/DocumentDeleteDialog.tsx
"use client";

/**
 * 書類削除確認ダイアログ
 * - ④編集ダイアログ内の「削除」ボタンから開く想定
 * - 「本当に削除しますか？」の確認 → 論理削除を実行
 * - デザインは他のダイアログ（背景色 #FAF6EF / 角丸 / アクセントカラー赤）に統一
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
import { removeDocumentAction } from "@/app/document/actions";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  /** 削除対象書類のID */
  documentId: number;
  /** 確認文言で表示する書類タイトル */
  documentTitle: string;
  /** 削除後に詳細画面から一覧へ遷移する場合は true（デフォルト true） */
  redirectAfterDelete?: boolean;
  /** 一覧画面など、削除後の親側で何かしたい場合のコールバック */
  onDeleted?: () => void;
};

export default function DocumentDeleteDialog({
  open,
  onClose,
  documentId,
  documentTitle,
  redirectAfterDelete = true,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const handleDelete = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await removeDocumentAction(documentId);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onClose();
      onDeleted?.();
      if (redirectAfterDelete) {
        // 詳細ページからの削除なら一覧へ
        router.push("/document");
        router.refresh();
      } else {
        router.refresh();
      }
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
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
        削除
      </DialogTitle>
      <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
        「{documentTitle}」を本当に削除してよろしいですか？
      </Typography>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="caption" sx={{ color: "#888780" }}>
          ※ 削除しても履歴上は残ります（論理削除）。
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
