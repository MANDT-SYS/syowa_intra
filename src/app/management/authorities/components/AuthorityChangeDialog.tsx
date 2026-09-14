"use client";

import * as React from "react";
import {
  Box,
  Button as MuiButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Button from "@/components/elements/Button";
import CommonDialog from "@/components/elements/CommonDialog";
import ConfirmDialog from "@/components/elements/ConfirmDialog";
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
      <CommonDialog
        open={open && !confirmOpen}
        onClose={submitting ? undefined : onClose}
        maxWidth="xs"
        title="権限を変更"
        description={`${current.userName}さんの変更後の権限を選択してください。`}
        actions={
          <>
            <MuiButton onClick={onClose} disabled={submitting} sx={{ color: "#5F5E5A" }}>
              キャンセル
            </MuiButton>
            <Button onClick={handleOpenConfirmation} disabled={submitting}>
              変更内容を確認
            </Button>
          </>
        }
      >
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
      </CommonDialog>

      <ConfirmDialog
        open={open && confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="変更確認"
        message={`${current.userName}さんを「${labelForAssignableAuthority(targetLevel)}」に変更しますか？`}
        confirmLabel="変更する"
        loadingConfirmLabel="変更中..."
        cancelLabel="戻る"
        loading={submitting}
        disableCloseWhileLoading
      />
    </>
  );
}
