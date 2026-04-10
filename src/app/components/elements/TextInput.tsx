"use client";

import React, { useCallback, useState } from "react";
import TextField from "@mui/material/TextField";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  denyPatterns?: RegExp[];
  style?: React.CSSProperties;
};

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength = 1000,
  denyPatterns = [/<script/i],
  style,
}) => {
  const [error, setError] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      if (input.length > maxLength) {
        setError(`${maxLength}文字以内で入力してください。`);
        return;
      }

      for (const pattern of denyPatterns) {
        if (pattern.test(input)) {
          setError("使用できない文字列が含まれています。");
          return;
        }
      }

      setError("");
      onChange(input);
    },
    [maxLength, denyPatterns, onChange]
  );

  return (
    <div style={{ flex: 1, ...style }}>
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        helperText={error}
      />
    </div>
  );
};

export default TextInput;