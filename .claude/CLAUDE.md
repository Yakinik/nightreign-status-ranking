# ELDEN RING: Nightreign ステータスランキング

## 概要

ELDEN RING: Nightreign の全10キャラクターのステータスを比較するシングルページアプリケーション。
レベル(1-15)ごとの能力値、遺物による変動、派生ステータス(HP/FP/スタミナ)をランキング表示する。

## 技術スタック

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Jotai** — アトムベース状態管理
- **CSS Modules** — コンポーネントスコープのスタイリング
- **MUI Icons** — アイコン表示（deep import でバンドル最小化）
- **pnpm** — パッケージマネージャ
- パスエイリアス: `@/*` → `./src/*`

## アーキテクチャ (FSD: Feature-Sliced Design)

```
src/
├── app/                    Next.js App Router (layout, page, globals.css)
├── views/home/             ページ構成 (HomePage)
├── widgets/ranking-table/  テーブルUI + CSS Modules
├── features/stat-ranking/  ランキングロジック (useRankedCharacters hook)
├── entities/character/     ドメインモデル (types, atoms, calc)
└── shared/                 定数, ラベル, Providers
data/
├── data.json               キャラクターデータ（ビルド時にstatic import）
├── wiki.txt                ソース: 遺物レベル別変動テーブル等
└── wiki2.txt               ソース: キャラクターレベル別能力値
```

依存方向: app → views → widgets → features → entities → shared（上位が下位を参照）

## データモデル

### data.json の構造

```jsonc
{
  "metadata": { "formulas": {...}, "statKeys": [...] },
  "characters": [
    {
      "name": "キャラ名",
      "levels": [
        // [level, vigor, mind, endurance, strength, dexterity, intelligence, faith, arcane]
        [1, 8, 4, 3, 5, 4, 2, 2, 10],
        // ... Lv1〜Lv15 の15行
      ],
      "relics": [
        {
          "name": "遺物名",
          "diffByLevel": [       // 8キャラ(追跡者〜執行者)はレベル別配列
            { "vigor": -1, ... },  // Lv1
            // ... 15要素
          ]
        },
        {
          "name": "遺物名",
          "diff": { "vigor": -3, "mind": 9 }  // 学者・葬儀屋は固定diff
        }
      ]
    }
  ]
}
```

### 派生ステータス計算式

| 派生値 | 計算式 |
|---|---|
| HP | `80 + vigor × 20` |
| FP | `45 + mind × 5` |
| スタミナ | `48 + endurance × 2` |

### 遺物の diff 解決

`applyRelics()` は `diffByLevel` があればレベル対応の diff を、なければ固定 `diff` を使う。
効果量は Lv12 で最大、Lv12-15 は同じ値。

### キャラクター一覧 (10体)

追跡者, 守護者, 鉄の目, レディ, 無頼漢, 復讐者, 隠者, 執行者, 学者, 葬儀屋

## 主要ファイルと責務

| ファイル | 責務 |
|---|---|
| `entities/character/model/types.ts` | StatKey, Character, Relic 等の型定義 |
| `entities/character/model/atoms.ts` | Jotai atoms (level, sort, filter) |
| `entities/character/lib/calc.ts` | getStatsAtLevel, applyRelics, calcDerived, getStatValue |
| `features/stat-ranking/model/hooks.ts` | useRankedCharacters (フィルタ→展開→ソート→ランク付け) |
| `widgets/ranking-table/ui/RankingTable.tsx` | テーブルUI, CharacterRow, CharacterFilterTh |
| `shared/lib/stat-labels.ts` | 日本語ラベル (vigor→生命力 等) |
| `shared/config/constants.ts` | MIN_LEVEL=1, MAX_LEVEL=15, STAT_KEYS |

## UI 機能

- **全比較表示**: 常に40行(10キャラ×4遺物パターン: なし/A/B/A+B)を表示
- **レベルスライダー**: Lv1〜15 を切り替え
- **キャラクターフィルタ**: th のフィルタアイコンをクリック → ポップオーバーでチェックボックス選択
- **ソート**: 任意の列ヘッダーをクリックで昇順/降順切り替え
- **Min/Max ハイライト**: 各列の最大値(青)・最小値(赤)を色付け
- **概算値警告アイコン**: 学者・葬儀屋の遺物適用行にはキャラ名左に WarningAmber アイコンを表示（固定diff のため概算）

## データに関する注意

- 遺物の wiki データに (?) 付きの値あり（レディ遺物2 Lv2 FP↑0、隠者遺物1 Lv7 信仰↓2、執行者遺物1 Lv8-9 HP非単調）
- 学者・葬儀屋はレベル別遺物テーブルが wiki に未掲載のため固定 diff のまま
- 葬儀屋 Lv7 HP=940 は wiki 原文の誤植（HP=640 に修正済み）

## コマンド

```sh
pnpm dev      # 開発サーバー起動
pnpm build    # プロダクションビルド
pnpm lint     # ESLint 実行
```
