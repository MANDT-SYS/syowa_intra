"use client";

import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import type { UserAuthorityLevel } from "@/types/authority";

type AuthorityChipProps =
  | {
      level: UserAuthorityLevel;
      label?: string;
    }
  | {
      level?: undefined;
      label: string;
    };

const authorityLabel: Record<UserAuthorityLevel, string> = {
  DEVELOPER: "開発者",
  AUTHORIZED_USER: "権限者",
  GENERAL: "一般",
};

const authorityChipColor: Record<UserAuthorityLevel, ChipProps["color"]> = {
  DEVELOPER: "error",
  AUTHORIZED_USER: "primary",
  GENERAL: "default",
};

export default function AuthorityChip({ level, label }: AuthorityChipProps) {
  const resolvedLabel = level ? (label ?? authorityLabel[level]) : label;

  return (
    <Chip
      label={resolvedLabel}
      color={level ? authorityChipColor[level] : "default"}
      size="small"
      variant={level === "GENERAL" || !level ? "outlined" : "filled"}
      sx={{ fontWeight: 700, borderRadius: "999px" }}
    />
  );
}
