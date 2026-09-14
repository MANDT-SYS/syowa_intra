//パンくずリスト
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { breadcrumbsLabelMap } from "./breadcrumbsMap";

// パンくずの1要素
type Crumb = {
  label: string;
  href: string;
  isCurrent: boolean; // 現在地かどうか
};

type BreadcrumbsProps = {
  currentLabel?: string;
};

// pathname から Crumb 配列を組み立てる
function buildCrumbs(pathname: string, currentLabel?: string): Crumb[] {
  // 例: "/document/test" → ["document", "test"]
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => {
    // この階層までのフルパス
    const href = "/" + segments.slice(0, i + 1).join("/");
    // マップに無いセグメントはそのまま表示（デコードしておく）
    const isCurrent = i === segments.length - 1;
    const label =
      isCurrent && currentLabel
        ? currentLabel
        : (breadcrumbsLabelMap[seg] ?? decodeURIComponent(seg));
    return {
      label,
      href,
      isCurrent,
    };
  });
}

export function Breadcrumbs({ currentLabel }: BreadcrumbsProps = {}) {
  const pathname = usePathname();

  // トップページではパンくずを出さない
  if (pathname === "/") return null;

  // 書類詳細では、詳細ページ側が取得済みの書類名を渡してパンくずを表示する。
  if (!currentLabel && /^\/document\/\d+\/?$/.test(pathname)) return null;

  const crumbs = buildCrumbs(pathname, currentLabel);

  return (
    <nav
      aria-label="breadcrumb"
      className="bg-white/20 backdrop-blur-sm border-b border-[#E5E2DC]"
    >
      <ol className="mx-auto max-w-1xl px-4 md:px-8 py-3 flex items-center gap-1.5 text-sm overflow-x-auto whitespace-nowrap">
        {/* ホームリンク */}
        <li className="flex items-center">
          <Link
            href="/"
            aria-label="ホーム"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[#8A857D] hover:text-[#2C2C2A] hover:bg-[#F1ECE3] transition-colors"
          >
            <HomeIcon sx={{ fontSize: 18 }} />
            <span className="hidden sm:inline">ホーム</span>
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <React.Fragment key={crumb.href}>
            <ChevronRightIcon
              sx={{ fontSize: 16, color: "#C7C2B8" }}
              aria-hidden="true"
            />
            <li>
              {crumb.isCurrent ? (
                // 現在のページはリンクにせず強調表示
                <span
                  aria-current="page"
                  className="px-2 py-1 font-semibold text-[#2C2C2A]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="px-2 py-1 rounded-md text-[#8A857D] hover:text-[#2C2C2A] hover:bg-[#F1ECE3] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
