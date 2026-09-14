"use client";

import { Box, Typography } from "@mui/material";

type EmptyStateProps = {
  message: string;
};

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "#888780" }}>
        {message}
      </Typography>
    </Box>
  );
}
