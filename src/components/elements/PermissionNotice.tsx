import { Box, Paper, Typography } from "@mui/material";

import PrimaryActionLink from "@/components/elements/PrimaryActionLink";

type PermissionNoticeProps = {
  kind: "authorization" | "resolution";
};

const messages = {
  authorization: {
    title: "このページを表示する権限がありません。",
    description: "利用可能な画面へ戻って操作してください。",
  },
  resolution: {
    title: "権限情報を確認できませんでした。",
    description: "時間をおいて再度お試しください。",
  },
} as const;

export default function PermissionNotice({ kind }: PermissionNoticeProps) {
  const message = messages[kind];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-8">
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid #E5E2DC",
          borderRadius: 3,
          bgcolor: "#FAF6EF",
          p: { xs: 3, sm: 5 },
          textAlign: "center",
        }}
      >
        <Box>
          <Typography component="h1" variant="h6" fontWeight={700} color="#2C2C2A">
            {message.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: "#5F5E5A" }}>
            {message.description}
          </Typography>
          <PrimaryActionLink href="/" sx={{ mt: 3 }}>
            ホームへ戻る
          </PrimaryActionLink>
        </Box>
      </Paper>
    </section>
  );
}
