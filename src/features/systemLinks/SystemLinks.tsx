"use client";

import React from "react";
import styles from "./SystemLinks.module.css";

// ─── ダミーデータ（実際のシステム情報に置き換えてください） ───
const systems = [
  {
    id: 3,
    name: "マスター管理システム",
    description: "業務マニュアルやナレッジの検索・共有ができます。",
    icon: "📖",
    url: "#",
    color: "#50B88E",
  },
  {
    id: 1,
    name: "工数集計システム",
    description: "勤務時間の確認ができます。",
    icon: "⏱",
    url: "#",
    color: "#E8655A",
  },
  {
    id: 2,
    name: "外注費管理システム",
    description: "交通費・経費の申請、承認状況の確認ができます。",
    icon: "💴",
    url: "#",
    color: "#4A90D9",
  },
  
  {
    id: 4,
    name: "安全衛生システム",
    description: "各種申請書の作成・承認フローを管理できます。",
    icon: "📋",
    url: "#",
    color: "#E8A64A",
  },
  {
    id: 5,
    name: "不適合管理システム",
    description: "社内メールの送受信、アドレス帳の管理ができます。",
    icon: "✉️",
    url: "#",
    color: "#8B6CC1",
  },
  {
    id: 6,
    name: "社有車予約システム",
    description: "会議室の空き状況確認と予約ができます。",
    icon: "🚗",
    url: "#",
    color: "#D4697A",
  },
];

export default function SystemLinks() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.label}>System Links</p>
          <h2 className={styles.title}>
            システムリンク
            <span className={styles.titleAccent} />
          </h2>
        </header>

        <div className={styles.grid}>
          {systems.map((sys, i) => (
            <a
              key={sys.id}
              href={sys.url}
              className={styles.card}
              style={
                {
                  "--card-accent": sys.color,
                  "--icon-bg": `${sys.color}12`,
                  animationDelay: `${i * 60}ms`,
                } as React.CSSProperties
              }
            >
              <div className={styles.iconWrap}>
                <span>{sys.icon}</span>
              </div>
              <div className={styles.cardName}>
                <span>{sys.name}</span>
                <span className={styles.arrow}>→</span>
              </div>
              <p className={styles.cardDesc}>{sys.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
