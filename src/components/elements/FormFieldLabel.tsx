import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";

type FormFieldLabelProps = {
  children: ReactNode;
  icon?: ReactNode;
};

/** フォーム項目の補助ラベル。入力値・バリデーションは扱わない。 */
export default function FormFieldLabel({ children, icon }: FormFieldLabelProps) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        color: "#86171F",
        fontWeight: 600,
        mb: 0.5,
      }}
    >
      {icon}
      {children}
    </Typography>
  );
}
