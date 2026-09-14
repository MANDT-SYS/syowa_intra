import type { ReactNode } from "react";
import { Box } from "@mui/material";

type PageSkeletonProps = {
  children: ReactNode;
  maxWidth?: number | string;
  label?: string;
};

export default function PageSkeleton({
  children,
  maxWidth = 1280,
  label = "ページを読み込んでいます",
}: PageSkeletonProps) {
  return (
    <Box
      component="section"
      aria-busy="true"
      aria-label={label}
      sx={{ minHeight: "100vh", px: { xs: 2, sm: 4 }, py: 4 }}
    >
      <Box sx={{ width: "100%", maxWidth, mx: "auto" }}>{children}</Box>
    </Box>
  );
}
