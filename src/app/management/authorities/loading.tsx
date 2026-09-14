import { Paper, Skeleton, Stack } from "@mui/material";
import DataGridSkeleton from "@/components/elements/DataGridSkeleton";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function AuthorityLoading() {
  return (
    <PageSkeleton label="権限設定を読み込んでいます">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "#FAF6EF",
          border: "1px solid #E5E2DC",
          borderRadius: 4,
        }}
      >
        <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Skeleton variant="text" width={120} height={34} />
          <Skeleton variant="text" width="60%" height={24} />
        </Stack>
        <DataGridSkeleton rowCount={7} />
      </Paper>
    </PageSkeleton>
  );
}
