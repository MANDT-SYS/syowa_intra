"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

type CommonDialogProps = {
  open: boolean;
  onClose?: DialogProps["onClose"];
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  description?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  transitionProps?: DialogProps["TransitionProps"];
  contentSx?: SystemStyleObject<Theme>;
  actionsLayout?: "flex-end" | "space-between";
};

export default function CommonDialog({
  open,
  onClose,
  title,
  children,
  actions,
  description,
  maxWidth = "sm",
  fullWidth = true,
  transitionProps,
  contentSx,
  actionsLayout = "flex-end",
}: CommonDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionProps={transitionProps}
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: "#FAF6EF", border: "1px solid #E5E2DC" },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, color: "#2C2C2A" }}>
        {title}
      </DialogTitle>
      {description && (
        <Typography variant="body2" sx={{ px: 3, color: "#5F5E5A" }}>
          {description}
        </Typography>
      )}
      {children && <DialogContent sx={{ pt: 2, ...contentSx }}>{children}</DialogContent>}
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: actionsLayout, gap: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
