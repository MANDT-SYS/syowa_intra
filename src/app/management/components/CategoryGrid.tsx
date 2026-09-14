// src/app/management/components/CategoryGrid.tsx
"use client";

/**
 * 書類カテゴリ 一覧グリッド（管理画面の「書類カテゴリ」タブ内）
 *
 * 表示項目（仕様：カテゴリidとカテゴリ名のみ）
 *  - No（行番号）
 *  - カテゴリID（id 表示）
 *  - カテゴリ名
 *  - 件数（参考情報）
 *  - 編集 / 削除 アイコン
 *
 * 各種ダイアログの開閉はこのコンポーネント内で管理する。
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import CategoryAddDialog from "@/app/management/components/CategoryAddDialog";
import CategoryEditDialog from "@/app/management/components/CategoryEditDialog";
import CategoryDeleteDialog from "@/app/management/components/CategoryDeleteDialog";
import CategoryStatusDialog from "@/app/management/components/CategoryStatusDialog";
import PrimaryActionButton from "@/components/elements/PrimaryActionButton";
import ResultDialog from "@/components/elements/ResultDialog";
import type { DocumentCategoryWithCount } from "@/types/interface";
import {
  commonDataGridProps,
  createCommonDataGridSx,
} from "@/components/elements/dataGridConfig";

type Props = {
  initialCategories: DocumentCategoryWithCount[];
};

export default function CategoryGrid({ initialCategories }: Props) {
  const router = useRouter();

  // ダイアログ用 state
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DocumentCategoryWithCount | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentCategoryWithCount | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<{
    category: DocumentCategoryWithCount;
    activeFlag: boolean;
  } | null>(null);
  const [resultMessage, setResultMessage] = React.useState("");

  // 行データに No を付与
  const rows = React.useMemo(
    () =>
      initialCategories.map((c, idx) => ({
        ...c,
        no: idx + 1,
      })),
    [initialCategories]
  );

  // 共通：データ更新後に画面を最新化
  const refresh = () => router.refresh();
  const handleCategoryAdded = () => {
    refresh();
    setResultMessage("登録が完了しました。");
  };
  const handleCategoryEdited = () => {
    refresh();
    setResultMessage("更新が完了しました。");
  };
  const handleCategoryDeleted = () => {
    refresh();
    setResultMessage("削除が完了しました。");
  };
  const handleCategoryStatusSaved = (activeFlag: boolean) => {
    refresh();
    setResultMessage(activeFlag ? "再有効化が完了しました。" : "使用停止が完了しました。");
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "no",
      headerName: "No",
      width: 70,
      align: "center",
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "actions",
      headerName: "編集/有効/削除",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => {
        const isUsed = p.row.document_count > 0;
        return (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="編集">
            <IconButton size="small" onClick={() => setEditTarget(p.row)} sx={{ color: "#5F5E5A" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={p.row.activeFlag ? "使用停止" : "再有効化"}>
            <IconButton
              size="small"
              onClick={() => setStatusTarget({ category: p.row, activeFlag: !p.row.activeFlag })}
              sx={{ color: "#5F5E5A" }}
            >
              {p.row.activeFlag ? <BlockIcon fontSize="small" /> : <ReplayIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              size="small"
              disabled={isUsed}
              onClick={() => setDeleteTarget(p.row)}
              sx={{ color: "#86171F" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        );
      },
    },
    {
      field: "activeFlag",
      headerName: "状態",
      width: 110,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <Chip
          label={p.value ? "有効" : "使用停止"}
          size="small"
          color={p.value ? "success" : "default"}
          variant={p.value ? "filled" : "outlined"}
        />
      ),
    },
    // {
    //   field: "id",
    //   headerName: "カテゴリID",
    //   flex: 1.2,
    //   minWidth: 180,
    //   renderCell: (p) => (
    //     <Typography variant="caption" sx={{ color: "#888780" }}>
    //       {p.value as number}
    //     </Typography>
    //   ),
    // },
    {
      field: "name",
      headerName: "カテゴリ名",
      flex: 1,
      minWidth: 160,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#2C2C2A" }}>
          {p.value as string}
        </Typography>
      ),
    },
    // {
    //   field: "document_count",
    //   headerName: "件数",
    //   width: 150,
    //   align: "center",
    //   headerAlign: "center",
    // },
    
    
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        bgcolor: "#fff",
        border: "1px solid #E5E2DC",
        borderRadius: 2,
        boxShadow: "none",
      }}
    >
      {/* 「新規追加」ボタンはグリッドと同じカード内の左上 */}
      <Stack direction="row" justifyContent="flex-start" sx={{ mb: 1.5 }}>
        <PrimaryActionButton
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          新規追加
        </PrimaryActionButton>
      </Stack>

      {/* DataGrid */}
      <Box
        sx={{
          width: "100%",
        }}
      >
        <DataGrid
          {...commonDataGridProps}
          rows={rows}
          columns={columns}
          sx={createCommonDataGridSx()}
        />
      </Box>

      {/* 追加ダイアログ */}
      <CategoryAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={handleCategoryAdded}
      />

      {/* 編集ダイアログ */}
      {editTarget && (
        <CategoryEditDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleCategoryEdited}
          current={editTarget}
        />
      )}

      {/* 削除ダイアログ */}
      {deleteTarget && (
        <CategoryDeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleCategoryDeleted}
          current={deleteTarget}
        />
      )}

      {statusTarget && (
        <CategoryStatusDialog
          open={!!statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={() => handleCategoryStatusSaved(statusTarget.activeFlag)}
          current={statusTarget.category}
          activeFlag={statusTarget.activeFlag}
        />
      )}
      <ResultDialog
        open={Boolean(resultMessage)}
        message={resultMessage}
        onClose={() => setResultMessage("")}
      />
    </Paper>
  );
}
