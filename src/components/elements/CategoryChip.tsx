"use client";

import { Chip } from "@mui/material";

type CategoryChipProps = {
  name: string;
};

const categoryChipColor = (name: string): string => {
  const palette = ["#E8C8B0", "#CFE0E8", "#D8E8C8", "#EAD8E8", "#E8E1B6"];
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return palette[hash % palette.length];
};

export default function CategoryChip({ name }: CategoryChipProps) {
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        bgcolor: categoryChipColor(name),
        color: "#5F4A2A",
        fontWeight: 600,
        borderRadius: "999px",
      }}
    />
  );
}
