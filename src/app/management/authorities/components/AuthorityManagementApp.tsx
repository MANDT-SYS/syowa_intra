"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import AuthorityGrid from "@/app/management/authorities/components/AuthorityGrid";
import type { AuthorityUserListItem } from "@/types/authority";

type Props = {
  actorUserId: number;
  initialUsers: AuthorityUserListItem[];
};

export default function AuthorityManagementApp({ actorUserId, initialUsers }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        bgcolor: "#FAF6EF",
        border: "1px solid #E5E2DC",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <Button
        component={Link}
        href="/management"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: "#5F5E5A" }}
      >
        管理画面へ戻る
      </Button>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
          権限設定
        </Typography>
        <Typography variant="body2" sx={{ color: "#5F5E5A", mt: 0.5 }}>
          社員の権限を「一般」と「権限者」の間で変更できます。開発者の権限は変更できません。
        </Typography>
      </Box>

      <AuthorityGrid actorUserId={actorUserId} initialUsers={initialUsers} />
    </Paper>
  );
}
