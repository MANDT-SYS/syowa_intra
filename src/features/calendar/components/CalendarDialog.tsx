//カレンダーダイアログ
"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@/app/components/elements/Button";
import MuiButton from "@mui/material/Button";
import type { CalendarWithUrl } from "@/features/calendar/actions";

// Props型: コンポーネントが受け取るプロパティの型定義
type Props = {
  open: boolean; // ダイアログの表示/非表示（trueで表示）
  onClose: () => void;// ダイアログを閉じるときのコールバック関数
  onSave: (formData: FormData) => Promise<void>; // 保存ボタン押下時に呼ばれる、FormDataを引数に取る非同期関数
  onDelete: () => Promise<void>; // 削除ボタン押下時に呼ばれる非同期関数
  current: CalendarWithUrl | null; // 編集対象カレンダー情報。新規の場合はnull
  existingYears: number[]; // 既存のカレンダー年リスト（重複チェック用）
};

// CalendarEditModalコンポーネント本体
export default function CalendarEditModal({
  open,         // ダイアログの開閉状態
  onClose,      // ダイアログを閉じるコールバック
  onSave,       // 保存処理コールバック
  onDelete,     // 削除処理コールバック
  current,      // 編集中カレンダー or 新規（null）
  existingYears // 既存カレンダー年リスト
}: Props) {
  const isNew = !current;

  // 年（year）の状態を管理。currentがあればその年、なければ現在の年を初期値とする
  const [year, setYear] = useState<number>(current?.year ?? new Date().getFullYear());
  // タイトル（title）の状態を管理。currentがあればそのタイトル、なければ空文字を初期値とする
  const [title, setTitle] = useState<string>(current?.title ?? "");
  // ファイル（PDF）の状態を管理。初期値はnull（新規の場合未選択）
  const [file, setFile] = useState<File | null>(null);
  // 保存処理中かどうかを管理（スピナーやボタン制御用）
  const [saving, setSaving] = useState(false);
  // エラーメッセージを管理。初期値は空文字
  const [errorMessage, setErrorMessage] = useState("");

  //ダイアログ開く処理
  const handleOpen = () => {
    setYear(current?.year ?? new Date().getFullYear());
    setTitle(current?.title ?? "");
    setFile(null);
    setErrorMessage("");
  };

  //カレンダー保存処理
  const handleSave = async () => {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください。");
      return;
    }

    if (isNew && !file) {
      setErrorMessage("PDFファイルを選択してください。");
      return;
    }

    if (isNew && existingYears.includes(year)) {
      setErrorMessage(`${year}年のカレンダーは既に登録されています。`);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (current) {
        formData.append("id", current.id);
      }
      formData.append("year", String(year));
      formData.append("title", title.trim());
      if (file) {
        formData.append("file", file);
      }
      await onSave(formData);
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage("保存に失敗しました。");
      }
    } finally {
      setSaving(false);
    }
  };

  //カレンダー削除処理
  const handleDelete = async () => {
    if (!current) return;
    if (!window.confirm(`${current.year}年のカレンダーを削除しますか？`)) return;

    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage("削除に失敗しました。");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
    >
      <DialogTitle>{isNew ? "カレンダー新規追加" : `${current.year}年 カレンダー編集`}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
        <TextField
          label="年"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={!isNew}
          fullWidth
          slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
        />
        <TextField
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
        <MuiButton variant="outlined" component="label" sx={{ textTransform: "none" }}>
          {file ? file.name : "PDFファイルを選択"}
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
            }}
          />
        </MuiButton>
        {!isNew && !file && (
          <p style={{ fontSize: "0.85rem", color: "#888", margin: 0 }}>
            ※ファイルを選択しない場合、PDFは変更されません
          </p>
        )}
        {errorMessage && (
          <p style={{ color: "red", margin: 0 }}>{errorMessage}</p>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <div>
          {!isNew && (
            <MuiButton
              color="error"
              onClick={handleDelete}
              disabled={saving}
            >
              削除
            </MuiButton>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <MuiButton onClick={onClose} disabled={saving}>
            キャンセル
          </MuiButton>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
