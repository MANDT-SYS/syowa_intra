"use client";

/**
 * 汎用：ファイルのドラッグ＆ドロップ＋クリック選択コンポーネント
 *
 * 役割
 *  - 単一ファイルを「ドロップ」または「クリックでファイル選択ダイアログ」で受け取る
 *  - 選択中のファイル名と、デフォルトのプレースホルダー表示を切替える
 *  - accept で MIME / 拡張子を制限可能
 *
 * 親コンポーネントは onChange で File | null を受け取って useState 等に保持する想定。
 * （フォーム送信時は親側で FormData に詰めて Server Action へ渡してください）
 */

import * as React from "react";
import { Box, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type Props = {
  /** 現在選択中のファイル。未選択なら null */
  file: File | null;
  /** ファイル選択時／解除時に呼ばれる */
  onChange: (file: File | null) => void;
  /** 入力時に許可する MIME / 拡張子（input[type=file] の accept と同じ書式） */
  accept?: string;
  /** プレースホルダーに表示する補足テキスト（例: "pdf / xlsx / image"） */
  hint?: string;
  /** 上部に表示する補助文。編集/改版ダイアログの「ファイルの変更がある場合のみ」など */
  helperText?: string;
};

export default function FileDropZone({
  file,// 現在選択中のファイル。未選択なら null
  onChange,// ファイル選択時／解除時に呼ばれる
  accept = ".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg",// 受け入れるファイル形式（デフォルト: PDF, Excel, Word, 画像ファイルを許可）
  hint = "pdf / excel / word / 画像 ",// 補足テキスト（下部プレースホルダーに表示。デフォルトは代表的な形式を記載）
  helperText,// 上部に表示する補助文。編集/改版ダイアログの「ファイルの変更がある場合のみ」など
}: Props) {
  // ドラッグオーバー時のハイライト用 state
  const [isDragOver, setIsDragOver] = React.useState(false);
  // クリックで input[type=file] を発火させるための ref
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // ファイル選択時のハンドラ（ドロップ・クリック選択共通）
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    // 仕様上は単一ファイルなので先頭だけ採用
    onChange(fileList[0]);
  };

  return (
    <Box
      // ドラッグ＆ドロップのイベントを Box で受ける
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      // クリックでファイル選択ダイアログを開く
      onClick={() => inputRef.current?.click()}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        border: "1.5px dashed",
        borderColor: isDragOver ? "#86171F" : "#C7C2B8",
        bgcolor: isDragOver ? "rgba(134,23,31,0.04)" : "rgba(255,255,255,0.5)",
        py: 3,
        px: 2,
        textAlign: "center",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#86171F",
          bgcolor: "rgba(134,23,31,0.03)",
        },
      }}
    >
      {/* 実体のinput。見えない */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <CloudUploadIcon sx={{ fontSize: 36, color: "#86171F", mb: 1 }} />

      {file ? (
        // ファイル選択済み：ファイル名と「クリックで変更」を表示
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#2C2C2A", wordBreak: "break-all" }}>
            {file.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "#888780" }}>
            クリックで別のファイルに変更
          </Typography>
        </>
      ) : (
        // 未選択：デフォルトプレースホルダー
        <>
          {helperText ? (
            <Typography variant="body2" sx={{ color: "#5F5E5A", whiteSpace: "pre-line" }}>
              {helperText}
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: "#5F5E5A" }}>
                ファイルをドラッグ＆ドロップ
              </Typography>
              <Typography variant="body2" sx={{ color: "#5F5E5A" }}>
                または クリックして選択
              </Typography>
            </>
          )}
          <Typography variant="caption" sx={{ color: "#888780", display: "block", mt: 0.5 }}>
            {hint}
          </Typography>
        </>
      )}
    </Box>
  );
}
