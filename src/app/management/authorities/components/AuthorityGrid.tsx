"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import AuthorityChangeDialog from "@/app/management/authorities/components/AuthorityChangeDialog";
import type { AuthorityUserListItem, UserAuthorityLevel } from "@/types/authority";

type GridRow = AuthorityUserListItem & { no: number };

const getAuthorityGridRowId = (row: GridRow): number => row.userId;

type Props = {
  actorUserId: number;
  initialUsers: AuthorityUserListItem[];
};

const authorityLabel: Record<UserAuthorityLevel, string> = {
  DEVELOPER: "開発者",
  AUTHORIZED_USER: "権限者",
  GENERAL: "一般",
};

const authorityChipColor: Record<UserAuthorityLevel, "error" | "primary" | "default"> = {
  DEVELOPER: "error",
  AUTHORIZED_USER: "primary",
  GENERAL: "default",
};

export default function AuthorityGrid({ actorUserId, initialUsers }: Props) {
  const router = useRouter();
  const [changeTarget, setChangeTarget] = React.useState<AuthorityUserListItem | null>(null);
  const [successMessage, setSuccessMessage] = React.useState("");

  const rows = React.useMemo<GridRow[]>(
    () => initialUsers.map((user, index) => ({ ...user, no: index + 1 })),
    [initialUsers]
  );

  const handleSaved = (message: string) => {
    setSuccessMessage(message);
    router.refresh();
  };

  const columns: GridColDef<GridRow>[] = [
    {
      field: "no",
      headerName: "No",
      width: 70,
      align: "center",
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "userName",
      headerName: "社員名",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: "divisionName",
      headerName: "部署",
      flex: 1,
      minWidth: 150,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "authorityLevel",
      headerName: "現在の権限",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const level = params.value as UserAuthorityLevel;
        return (
          <Chip
            label={authorityLabel[level]}
            color={authorityChipColor[level]}
            size="small"
            variant={level === "GENERAL" ? "outlined" : "filled"}
            sx={{ fontWeight: 700 }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.authorityLevel === "DEVELOPER") {
          return <Typography variant="caption" sx={{ color: "#888780" }}>変更不可</Typography>;
        }
        if (params.row.userId === actorUserId) {
          return <Typography variant="caption" sx={{ color: "#888780" }}>自分自身は変更不可</Typography>;
        }

        return (
          <Tooltip title="権限を変更">
            <IconButton
              size="small"
              aria-label={`${params.row.userName}の権限を変更`}
              onClick={() => setChangeTarget(params.row)}
              sx={{ color: "#5F5E5A" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
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
          getRowId={getAuthorityGridRowId}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          getRowHeight={() => "auto"}
          sx={{ "& .MuiDataGrid-cell": { py: 1.2 } }}
        />
      </Box>

      {changeTarget && (
        <AuthorityChangeDialog
          open={Boolean(changeTarget)}
          current={changeTarget}
          onClose={() => setChangeTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
