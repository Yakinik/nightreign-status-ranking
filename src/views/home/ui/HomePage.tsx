"use client";

import { RankingTable } from "@/widgets/ranking-table";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nightreign ステータスランキング</h1>
      </header>
      <RankingTable />
      <footer className={styles.footer}>
        <p className={styles.disclaimer}>
          データは{" "}
          <a
            className={styles.link}
            href="https://kamikouryaku.net/nightreign_eldenring/"
            target="_blank"
            rel="noopener noreferrer"
          >
            エルデンリング ナイトレイン 攻略wiki | 神攻略
          </a>{" "}
          より引用
        </p>
      </footer>
    </main>
  );
}
