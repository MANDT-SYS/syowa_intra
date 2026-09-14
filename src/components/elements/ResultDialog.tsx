"use client";

import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import PrimaryActionButton from "@/components/elements/PrimaryActionButton";

type ResultDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  title?: string;
};

export default function ResultDialog({
  open,
  message,
  onClose,
  title = "完了",
}: ResultDialogProps) {
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
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#5F5E5A" }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end" }}>
        <PrimaryActionButton onClick={onClose}>OK</PrimaryActionButton>
      </DialogActions>
    </Dialog>
  );
}
