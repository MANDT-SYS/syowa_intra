"use client";

import React from "react";
import Button from "@/app/components/elements/Button";
import styles from "./QuickLinks.module.css";

/** カード背景（左から順にピンク・緑・水色・ラベンダー） */
const CARD_VARIANTS = [
  styles.cardPink,//ピンク
  styles.cardGreen,//緑
  styles.cardCyan,//水色
  styles.cardLavender,//ラベンダー
] as const;

//クイックリンク項目
export type QuickLinkItem = {
  href: string;//リンク
  title: string;//タイトル
  /** 未指定時はプレースホルダ文言 */
  description?: string;//説明
};

//クイックリンクプロパティ
type QuickLinksProps = {
  items: QuickLinkItem[];//クイックリンク項目
};

const DEFAULT_DESCRIPTION =
  "";

export function QuickLinks({ items }: QuickLinksProps) {
  return (
    <nav aria-label="クイックリンク" className={styles.grid}>
      {items.map((item, index) => {
        const toneClass = CARD_VARIANTS[index % CARD_VARIANTS.length];
        return (
          <article
            key={`${item.href}-${item.title}`}
            className={`${styles.card} ${toneClass}`}
          >
            <div className={styles.iconPlaceholder} aria-hidden />
            <h3 className={styles.title}>{item.title}</h3>
            {/* ↓説明文とボタンのスペースを狭めるため、pタグのmargin-bottomを0に、actionsにmargin-topを少しだけ */}
            <p
              className={styles.description}
              style={{
                marginBottom: "0.3rem",
              }}
            >
              {item.description ?? DEFAULT_DESCRIPTION}
            </p>
            <div
              className={styles.actions}
              style={{
                marginTop: "0.3rem",
                paddingTop: "0.2rem",
              }}
            >
              <Button
                type="button"
                onClick={() => (window.location.href = item.href)}
                sx={{ textTransform: "none" }}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "8px",
                  minWidth: 0,
                }}
              >
                移動
                <span className={styles.arrow} aria-hidden>
                  &gt;
                </span>
              </Button>
            </div>
          </article>
        );
      })}
    </nav>
  );
}
