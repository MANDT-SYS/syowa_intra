import { Box, Paper, Skeleton, Stack } from "@mui/material";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function DocumentDetailLoading() {
  return (
    <PageSkeleton maxWidth={1536} label="書類詳細を読み込んでいます">
      <Skeleton variant="text" width={130} height={28} sx={{ mb: 2 }} />
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="text" width={260} height={36} />
          <Skeleton variant="rounded" width={80} height={28} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={96} height={40} />
          <Skeleton variant="rounded" width={96} height={40} />
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 1fr) 2fr" },
          gap: 2,
        }}
      >
        <Stack spacing={2}>
          {Array.from({ length: 5 }, (_, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{ p: 2, bgcolor: "#fff", border: "1px solid #E5E2DC", borderRadius: 3 }}
            >
              <Skeleton variant="text" width="42%" height={24} />
              <Skeleton variant="text" width="78%" height={28} />
              <Skeleton variant="text" width="56%" height={22} />
            </Paper>
          ))}
        </Stack>

        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: "#fff", border: "1px solid #E5E2DC", borderRadius: 3 }}
        >
          <Skeleton variant="text" width={90} height={26} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="100%" height={520} />
        </Paper>
      </Box>
    </PageSkeleton>
  );
}
