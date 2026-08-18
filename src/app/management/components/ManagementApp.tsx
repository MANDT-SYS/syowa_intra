// src/app/management/components/ManagementApp.tsx
"use client";

/**
 * ⑥ 管理画面クライアントコンポーネント
 *
 * 構成
 *  - 大項目（アコーディオン）: 書類管理（今後：お知らせ管理 / ユーザー管理 / システム管理 を追加予定）
 *    - 中項目（タブ）: 書類カテゴリ（今後：テンプレート / 承認フロー を追加予定）
 *      - DataGrid: カテゴリ一覧（追加・編集・削除）
 *
 * 今後の拡張ポイント
 *  - sections 配列に AccordionItem を足せばアコーディオンが増える
 *  - 各 section の tabs に項目を足せばタブが増える
 *  - 各タブの content に対応するクライアントコンポーネントを差し込めばOK
 */

import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryGrid from "@/app/management/components/CategoryGrid";
import type { DocumentCategoryWithCount } from "@/types/interface";

type Props = {
  initialCategories: DocumentCategoryWithCount[];
  canManageAuthorities: boolean;
};

// 中項目タブの定義型
type TabDef = {
  key: string;
  label: string;
  content: React.ReactNode;
};

// 大項目アコーディオンの定義型
type SectionDef = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  tabs: TabDef[];
};

export default function ManagementApp({ initialCategories, canManageAuthorities }: Props) {
  // 「マスター管理」アコーディオンを定義
  const sections: SectionDef[] = [
    {
      key: "master",
      title: "マスター管理",
      description: "",
      icon: <DescriptionIcon sx={{ color: "#86171F" }} />,
      defaultOpen: true,
      tabs: [
        {
          key: "category",
          label: "書類カテゴリ",
          content: <CategoryGrid initialCategories={initialCategories} />,
        },
        // 今後追加：テンプレート、承認フロー
      ],
    },
    // 今後追加：お知らせ管理 / ユーザー管理 / システム管理
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        bgcolor: "#FAF6EF",
        border: "1px solid #E5E2DC",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C2C2A", mb: 2 }}>
        管理
      </Typography>

      {canManageAuthorities && (
        <Button
          component={Link}
          href="/management/authorities"
          variant="outlined"
          sx={{ mb: 2, borderColor: "#C7C2B8", color: "#5F5E5A" }}
        >
          権限設定
        </Button>
      )}

      {/* セクション（アコーディオン）リスト */}
      <Stack spacing={1.5}>
        {sections.map((section) => (
          <ManagementSection key={section.key} section={section} />
        ))}
      </Stack>
    </Paper>
  );
}

// ─────────────────────────────────────────────
// 1つのアコーディオンセクション（中にタブを持つ）
// ─────────────────────────────────────────────
function ManagementSection({ section }: { section: SectionDef }) {
  const [activeTab, setActiveTab] = React.useState(section.tabs[0]?.key ?? "");

  return (
    <>
      <Accordion
        defaultExpanded={section.defaultOpen}
        disableGutters
        square={false}
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#fff",
          border: "1px solid #E5E2DC",
          boxShadow: "none",
          "&:before": { display: "none" }, // 上線を消す
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#5F5E5A" }} />}
          sx={{ px: 2, py: 1.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#FAF1ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {section.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
                {section.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#888780" }}>
                {section.description}
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ borderTop: "1px solid #EDEAE2", bgcolor: "#FBF7F0", pt: 2 }}>
          {/* タブ（今は1個でも将来増える前提） */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              mb: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                color: "#888780",
              },
              "& .Mui-selected": { color: "#86171F !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#86171F" },
            }}
          >
            {section.tabs.map((tab) => (
              <Tab key={tab.key} value={tab.key} label={tab.label} />
            ))}
          </Tabs>
          {/* 選択中タブのコンテンツ */}
          {section.tabs.map((tab) =>
            tab.key === activeTab ? <Box key={tab.key}>{tab.content}</Box> : null
          )}
        </AccordionDetails>
      </Accordion>

      {/* ▼ お知らせ管理のアコーディオンも追加 */}
      {section.key === "documents" && (
        <Accordion
          defaultExpanded={false}
          disableGutters
          square={false}
          sx={{
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "#fff",
            border: "1px solid #E5E2DC",
            boxShadow: "none",
            mt: 2
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#5F5E5A" }} />}
            sx={{ px: 2, py: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  // ここでお知らせアイコン背景の角を丸くしている（2=16px）
                  borderRadius: 2,
                  bgcolor: "#F0F6FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* お知らせアイコン: 任意で変更可 */}
                <span role="img" aria-label="お知らせ" style={{ fontSize: 22 }}>📝</span>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
                  お知らせ
                </Typography>
                <Typography variant="caption" sx={{ color: "#888780" }}>
                  カテゴリなどの管理
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ borderTop: "1px solid #EDEAE2", bgcolor: "#FBF7F0", pt: 2 }}>
            <Tabs
              value={"notice-category"}
              sx={{
                mb: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#888780",
                },
                "& .Mui-selected": { color: "#156399 !important" },
                "& .MuiTabs-indicator": { backgroundColor: "#156399" },
              }}
            >
              <Tab value="notice-category" label="お知らせカテゴリ" />
              {/* 今後他タブ追加可 */}
            </Tabs>
            {/* お知らせカテゴリ管理コンテンツ */}
            <Box>
              {/* TODO: お知らせカテゴリ管理用のコンポーネントを作成・設置してください */}
              お知らせカテゴリ管理（未実装）
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
