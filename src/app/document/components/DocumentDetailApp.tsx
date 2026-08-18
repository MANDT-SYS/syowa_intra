// src/app/document/components/DocumentDetailApp.tsx
"use client";

/**
 * ② 書類管理詳細クライアントコンポーネント
 *
 * 機能
 *  - ヘッダー：書類タイトル + カテゴリチップ + 「修正」「改版」ボタン
 *  - 左カラム：メタ情報（書類名/カテゴリ/説明/改版履歴）
 *  - 右カラム：プレビュー（PDFはiframe、画像は<img>、xlsxはダウンロード誘導）
 *              プレビュー上にダウンロードボタン
 *  - 「修正」「改版」「削除」はそれぞれダイアログを表示
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import NotesIcon from "@mui/icons-material/Notes";
import HistoryIcon from "@mui/icons-material/History";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EditIcon from "@mui/icons-material/Edit";
import LoopIcon from "@mui/icons-material/Loop";
import DownloadIcon from "@mui/icons-material/Download";
import DocumentEditDialog from "@/app/document/components/DocumentEditDialog";
import DocumentRevisionDialog from "@/app/document/components/DocumentRevisionDialog";
import DocumentDeleteDialog from "@/app/document/components/DocumentDeleteDialog";
import type { DivisionInfo, DocumentCategory, DocumentDetailData } from "@/types/interface";

type Props = {
  detail: DocumentDetailData;
  categories: DocumentCategory[];
  divisions: DivisionInfo[];
};

// 日付 YYYY/MM/DD
const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
};

// セクションのカード枠（左カラムの各ブロック）
const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      bgcolor: "#fff",
      border: "1px solid #E5E2DC",
    }}
  >
    <Typography
      variant="caption"
      sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#86171F", fontWeight: 600, mb: 1 }}
    >
      {icon}
      {title}
    </Typography>
    {children}
  </Paper>
);

export default function DocumentDetailApp({ detail, categories, divisions }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // 編集ダイアログ内「削除」 → 編集を閉じて削除確認を開く
  const handleRequestDelete = () => {
    setEditOpen(false);
    setDeleteOpen(true);
  };

  // 保存系の onSaved 共通：サーバー側で revalidatePath 済みだが念のため再取得
  const handleSaved = () => {
    router.refresh();
  };

  // ファイルダウンロード（同一オリジン API 経由で保存）
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `/document/download?id=${detail.id}`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    // <Paper
    //   elevation={0}
    //   sx={{
    //     p: { xs: 2, sm: 3 },
    //     borderRadius: 4,
    //     bgcolor: "#FAF6EF",
    //     border: "1px solid #E5E2DC",
    //     boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    //   }}
    // >
    <Box>
      {/* ヘッダー行：タイトル＋カテゴリ＋ボタン群 */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
            {detail.title}
          </Typography>
          {detail.category_name && (
            <Chip
              label={detail.category_name}
              size="small"
              sx={{ bgcolor: "#E8C8B0", color: "#5F4A2A", fontWeight: 600, borderRadius: "999px" }}
            />
          )}
          {detail.current_revision_number !== null && (
            <Typography variant="caption" sx={{ color: "#888780" }}>
              {detail.current_revision_number}版
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <MuiButton
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            sx={{
              borderColor: "#C7C2B8",
              color: "#5F5E5A",
              bgcolor: "#fff",
              "&:hover": { borderColor: "#86171F", color: "#86171F" },
            }}
          >
            修正
          </MuiButton>
          <MuiButton
            variant="contained"
            startIcon={<LoopIcon />}
            onClick={() => setRevisionOpen(true)}
            sx={{
              bgcolor: "#86171F",
              "&:hover": { bgcolor: "#6C111A" },
              boxShadow: "none",
            }}
          >
            改版
          </MuiButton>
        </Stack>
      </Stack>

      {/* 2カラム：左メタ情報・右プレビュー */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 1fr) 2fr" },
          gap: 2,
        }}
      >
        {/* 左カラム */}
        <Stack spacing={2}>
          <SectionCard icon={<DescriptionIcon sx={{ fontSize: 16 }} />} title="書類名">
            <Typography variant="body2" sx={{ color: "#2C2C2A" }}>
              {detail.title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#888780" }}>
              管理番号: {detail.management_number}
            </Typography>
          </SectionCard>

          <SectionCard icon={<CategoryIcon sx={{ fontSize: 16 }} />} title="カテゴリ">
            <Typography variant="body2" sx={{ color: "#2C2C2A" }}>
              {detail.category_name ?? "—"}
            </Typography>
          </SectionCard>

          <SectionCard icon={<ApartmentIcon sx={{ fontSize: 16 }} />} title="立案部署">
            <Typography variant="body2" sx={{ color: "#2C2C2A" }}>
              {detail.division_name ?? "—"}
            </Typography>
          </SectionCard>

          <SectionCard icon={<NotesIcon sx={{ fontSize: 16 }} />} title="説明">
            <Typography variant="body2" sx={{ color: "#2C2C2A", whiteSpace: "pre-wrap" }}>
              {detail.description ?? "—"}
            </Typography>
          </SectionCard>

          {/* 改版履歴（新しい順） */}
          <SectionCard icon={<HistoryIcon sx={{ fontSize: 16 }} />} title="改版履歴">
            {detail.revisions.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#888780" }}>
                履歴はまだありません
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", rowGap: 1, columnGap: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#888780", fontWeight: 700 }}>版</Typography>
                <Typography variant="caption" sx={{ color: "#888780", fontWeight: 700 }}>日付</Typography>
                <Typography variant="caption" sx={{ color: "#888780", fontWeight: 700 }}>理由</Typography>
                {detail.revisions.map((r) => (
                  <React.Fragment key={r.id}>
                    <Typography variant="body2" sx={{ color: "#2C2C2A" }}>{r.revision_number}版</Typography>
                    <Typography variant="body2" sx={{ color: "#2C2C2A" }}>{formatDate(r.created_at)}</Typography>
                    <Typography variant="body2" sx={{ color: "#2C2C2A", whiteSpace: "pre-wrap" }}>
                      {r.notes ?? "—"}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>
            )}
          </SectionCard>
        </Stack>

        {/* 右カラム：プレビュー */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px solid #E5E2DC",
            display: "flex",
            flexDirection: "column",
            minHeight: 540,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#86171F", fontWeight: 600 }}
            >
              プレビュー
            </Typography>
            <IconButton
              size="small"
              onClick={handleDownload}
              disabled={!detail.file_url}
              sx={{ color: "#86171F" }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              border: "1px dashed #E5E2DC",
              bgcolor: "#FAF8F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 480,
              overflow: "hidden",
            }}
          >
            {!detail.file_url ? (
              <Stack alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ fontSize: 40, color: "#C7C2B8" }} />
                <Typography variant="body2" sx={{ color: "#888780" }}>
                  ファイルがありません
                </Typography>
              </Stack>
            ) : detail.file_type === "pdf" ? (
              // PDFはiframeでプレビュー
              <iframe
                src={detail.file_url}
                title={detail.file_name ?? "PDF"}
                style={{ width: "100%", height: "100%", border: 0, minHeight: 480 }}
              />
            ) : detail.file_type === "image" ? (
              // 画像
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.file_url}
                alt={detail.file_name ?? "image"}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              // xlsx / word 等はブラウザでプレビュー不可なので案内
              <Stack alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ fontSize: 40, color: "#C7C2B8" }} />
                <Typography variant="body2" sx={{ color: "#888780" }}>
                  excel / word 形式はブラウザでプレビューできません
                </Typography>
                <MuiButton
                  onClick={handleDownload}
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: "#86171F", color: "#86171F" }}
                >
                  ダウンロードして開く
                </MuiButton>
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>

      {/* ④編集ダイアログ */}
      <DocumentEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
        onRequestDelete={handleRequestDelete}
        current={detail}
        categories={categories}
        divisions={divisions}
      />

      {/* ⑤改版ダイアログ */}
      <DocumentRevisionDialog
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        onSaved={handleSaved}
        current={detail}
        categories={categories}
        divisions={divisions}
      />

      {/* 削除確認ダイアログ */}
      <DocumentDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        documentId={detail.id}
        documentTitle={detail.title}
        redirectAfterDelete
      />
     {/* </Paper> */}
   </Box>
  );
}
