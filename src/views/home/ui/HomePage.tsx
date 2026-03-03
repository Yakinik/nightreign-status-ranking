'use client';

import { RankingTable } from '@/widgets/ranking-table';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>NIGHTREIGN ステータスランキング</h1>
        <p className={styles.subtitle}>
          ELDEN RING: NIGHTREIGN 全キャラクターステータス比較
        </p>
      </header>
      <RankingTable />
    </main>
  );
}
