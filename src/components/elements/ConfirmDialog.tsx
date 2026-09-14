"use client";

import type { ReactNode } from "react";
import { Button as MuiButton, Typography } from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";
import Button from "@/components/elements/Button";
import CommonDialog from "@/components/elements/CommonDialog";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  children?: ReactNode;
  confirmLabel: string;
  loadingConfirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  disableCloseWhileLoading?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  transitionProps?: DialogProps["TransitionProps"];
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmLabel,
  loadingConfirmLabel,
  cancelLabel = "キャンセル",
  loading = false,
  disableCloseWhileLoading = false,
  maxWidth = "xs",
  transitionProps,
}: ConfirmDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={disableCloseWhileLoading && loading ? undefined : onClose}
      title={title}
      maxWidth={maxWidth}
      transitionProps={transitionProps}
      actions={
        <>
          <MuiButton onClick={onClose} disabled={loading} sx={{ color: "#5F5E5A" }}>
            {cancelLabel}
          </MuiButton>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? loadingConfirmLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <Typography variant="body2" sx={{ color: "#5F5E5A" }}>
        {message}
      </Typography>
      {children}
    </CommonDialog>
  );
}
