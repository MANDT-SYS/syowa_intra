"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AuthorityChangeDialog from "@/app/management/authorities/components/AuthorityChangeDialog";
import ResultDialog from "@/components/elements/ResultDialog";
import AuthorityChip from "@/components/elements/AuthorityChip";
import type { AuthorityUserListItem, UserAuthorityLevel } from "@/types/authority";
import {
  commonDataGridProps,
  createCommonDataGridSx,
} from "@/components/elements/dataGridConfig";

type GridRow = AuthorityUserListItem & { no: number };

const getAuthorityGridRowId = (row: GridRow): number => row.userId;

type Props = {
  actorUserId: number;
  initialUsers: AuthorityUserListItem[];
};

export default function AuthorityGrid({ actorUserId, initialUsers }: Props) {
  const router = useRouter();
  const [changeTarget, setChangeTarget] = React.useState<AuthorityUserListItem | null>(null);
  const [resultMessage, setResultMessage] = React.useState("");

  const rows = React.useMemo<GridRow[]>(
    () => initialUsers.map((user, index) => ({ ...user, no: index + 1 })),
    [initialUsers]
  );

  const handleSaved = (message: string) => {
    setResultMessage(message);
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
        return <AuthorityChip level={level} />;
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
        }}
      >
        <DataGrid
          {...commonDataGridProps}
          rows={rows}
          columns={columns}
          getRowId={getAuthorityGridRowId}
          sx={createCommonDataGridSx()}
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

      <ResultDialog
        open={Boolean(resultMessage)}
        message={resultMessage}
        onClose={() => setResultMessage("")}
      />
    </>
  );
}
