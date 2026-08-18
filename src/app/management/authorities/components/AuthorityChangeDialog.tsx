"use client";

import * as React from "react";
import {
  Box,
  Button as MuiButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Button from "@/components/elements/Button";
import { changeAuthorityAction } from "@/app/management/authorities/actions";
import type { AssignableAuthorityLevel, AuthorityUserListItem } from "@/types/authority";

type Props = {
  open: boolean;
  current: AuthorityUserListItem;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const labelForAssignableAuthority = (level: AssignableAuthorityLevel): string =>
  level === "AUTHORIZED_USER" ? "権限者" : "一般";

const initialAssignableLevel = (current: AuthorityUserListItem): AssignableAuthorityLevel =>
  current.authorityLevel === "AUTHORIZED_USER" ? "AUTHORIZED_USER" : "GENERAL";

export default function AuthorityChangeDialog({ open, current, onClose, onSaved }: Props) {
  const [targetLevel, setTargetLevel] = React.useState<AssignableAuthorityLevel>(
    initialAssignableLevel(current)
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTargetLevel(initialAssignableLevel(current));
      setConfirmOpen(false);
      setSubmitting(false);
      setError("");
    }
  }, [current, open]);

  const handleOpenConfirmation = () => {
    setError("");
    if (targetLevel === initialAssignableLevel(current)) {
      setError("変更後の権限を選択してください。");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const result = await changeAuthorityAction(current.userId, targetLevel);
      if (!result.success) {
        setConfirmOpen(false);
        setError(result.error);
        return;
      }

      setConfirmOpen(false);
      onSaved(result.message);
      onClose();
    } catch (caught) {
      setConfirmOpen(false);
      setError(caught instanceof Error ? caught.message : "権限の変更に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open && !confirmOpen}
        onClose={submitting ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
        }}
      >
        <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
          権限を変更
        </DialogTitle>
        <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
          {current.userName}さんの変更後の権限を選択してください。
        </Typography>

        <DialogContent sx={{ pt: 2 }}>
          <Box>
            <FormControl fullWidth size="small" disabled={submitting}>
              <InputLabel id="authority-level-label">変更後の権限</InputLabel>
              <Select
                labelId="authority-level-label"
                label="変更後の権限"
                value={targetLevel}
                onChange={(event) => setTargetLevel(event.target.value as AssignableAuthorityLevel)}
              >
                <MenuItem value="GENERAL">一般</MenuItem>
                <MenuItem value="AUTHORIZED_USER">権限者</MenuItem>
              </Select>
            </FormControl>
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
          <Button onClick={handleOpenConfirmation} disabled={submitting}>
            変更内容を確認
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open && confirmOpen}
        onClose={submitting ? undefined : () => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
        }}
      >
        <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
          変更確認
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#5F5E5A" }}>
            {current.userName}さんを「{labelForAssignableAuthority(targetLevel)}」に変更しますか？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end", gap: 1 }}>
          <MuiButton
            onClick={() => setConfirmOpen(false)}
            disabled={submitting}
            sx={{ color: "#5F5E5A" }}
          >
            戻る
          </MuiButton>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "変更中..." : "変更する"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
