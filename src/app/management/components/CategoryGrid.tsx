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
  Button as MuiButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import CategoryAddDialog from "@/app/management/components/CategoryAddDialog";
import CategoryEditDialog from "@/app/management/components/CategoryEditDialog";
import CategoryDeleteDialog from "@/app/management/components/CategoryDeleteDialog";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  initialCategories: DocumentCategoryWithCount[];
};

export default function CategoryGrid({ initialCategories }: Props) {
  const router = useRouter();

  // ダイアログ用 state
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DocumentCategoryWithCount | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentCategoryWithCount | null>(null);

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
      field: "id",
      headerName: "カテゴリID",
      flex: 1.2,
      minWidth: 180,
      renderCell: (p) => (
        <Typography variant="caption" sx={{ color: "#888780" }}>
          {p.value as number}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "カテゴリ名",
      flex: 1,
      minWidth: 160,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
          {p.value as string}
        </Typography>
      ),
    },
    {
      field: "document_count",
      headerName: "件数",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="編集">
            <IconButton size="small" onClick={() => setEditTarget(p.row)} sx={{ color: "#5F5E5A" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton size="small" onClick={() => setDeleteTarget(p.row)} sx={{ color: "#86171F" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{ p: 0, bgcolor: "transparent", boxShadow: "none" }}
    >
      {/* 「新規追加」ボタンは右上 */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        <MuiButton
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{
            borderColor: "#C7C2B8",
            color: "#5F5E5A",
            bgcolor: "#fff",
            "&:hover": { borderColor: "#86171F", color: "#86171F" },
          }}
        >
          新規追加
        </MuiButton>
      </Stack>

      {/* DataGrid */}
      <Box
        sx={{
          width: "100%",
          "& .MuiDataGrid-root": { border: "none", bgcolor: "transparent" },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#F1ECE3",
            borderBottom: "1px solid #E5E2DC",
          },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, color: "#5F5E5A" },
          "& .MuiDataGrid-cell": { borderBottom: "1px solid #EDEAE2" },
          "& .MuiDataGrid-row:hover": { bgcolor: "rgba(134,23,31,0.04)" },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #E5E2DC" },
        }}
      >
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          getRowHeight={() => "auto"}
          sx={{
            "& .MuiDataGrid-cell": { py: 1.2 },
          }}
        />
      </Box>

      {/* 追加ダイアログ */}
      <CategoryAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={refresh}
      />

      {/* 編集ダイアログ */}
      {editTarget && (
        <CategoryEditDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={refresh}
          current={editTarget}
        />
      )}

      {/* 削除ダイアログ */}
      {deleteTarget && (
        <CategoryDeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={refresh}
          current={deleteTarget}
        />
      )}
    </Paper>
  );
}
