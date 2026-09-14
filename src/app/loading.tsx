import { Box, Skeleton, Stack } from "@mui/material";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function Loading() {
  return (
    <PageSkeleton maxWidth={1152} label="ホーム画面を読み込んでいます">
      <Skeleton variant="rounded" width="100%" height={360} sx={{ mb: 5 }} />

      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
          mb: 5,
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Stack
            key={index}
            alignItems="center"
            spacing={1.5}
            sx={{ bgcolor: "#fff", borderRadius: 2, p: 3 }}
          >
            <Skeleton variant="rounded" width={56} height={56} />
            <Skeleton variant="text" width="60%" height={28} />
          </Stack>
        ))}
      </Box>

      <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={120} />
    </PageSkeleton>
  );
}
