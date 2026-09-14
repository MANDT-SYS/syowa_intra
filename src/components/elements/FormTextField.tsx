"use client";

import TextField, { type TextFieldProps } from "@mui/material/TextField";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

type FormTextFieldProps = Omit<TextFieldProps, "sx"> & {
  sx?: SystemStyleObject<Theme>;
};

/**
 * フォーム用の見た目だけを揃えるTextField。
 * 値、検証、エラー、disabled状態は呼び出し側の指定をそのまま使用する。
 */
export default function FormTextField({
  fullWidth = true,
  size = "small",
  sx,
  ...props
}: FormTextFieldProps) {
  return (
    <TextField
      {...props}
      fullWidth={fullWidth}
      size={size}
      sx={{
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
        "& .MuiFormHelperText-root": { mx: 0 },
        ...sx,
      }}
    />
  );
}
