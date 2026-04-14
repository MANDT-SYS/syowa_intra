"use client";

import React from "react";
import Button from "@/app/components/elements/Button";
import styles from "./QuickLinks.module.css";

/** カード背景（左から順にピンク・緑・水色・ラベンダー） */
const CARD_VARIANTS = [
  styles.cardPink,
  styles.cardGreen,
  styles.cardCyan,
  styles.cardLavender,
] as const;

export type QuickLinkItem = {
  href: string;
  title: string;
  /** 未指定時はプレースホルダ文言 */
  description?: string;
};

type QuickLinksProps = {
  items: QuickLinkItem[];
};

const DEFAULT_DESCRIPTION =
  "説明が入ります。説明が入ります。説明が入ります。";

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
            <p className={styles.description}>
              {item.description ?? DEFAULT_DESCRIPTION}
            </p>
            <div className={styles.actions}>
              <Button href={item.href} sx={{ textTransform: "none" }}>
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
