"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import {
  selectedLevelAtom,
  sortKeyAtom,
  sortDirectionAtom,
  characterFilterAtom,
  allCharacterNamesAtom,
  getStatValue,
} from "@/entities/character";
import type { SortKey, StatKey, DerivedStatKey } from "@/entities/character";
import { useRankedCharacters } from "@/features/stat-ranking";
import type { RankedEntry } from "@/features/stat-ranking";
import { STAT_LABELS, DERIVED_LABELS } from "@/shared/lib/stat-labels";
import { MIN_LEVEL, MAX_LEVEL } from "@/shared/config/constants";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import FilterAlt from "@mui/icons-material/FilterAlt";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import styles from "./RankingTable.module.css";

const DERIVED_KEYS: DerivedStatKey[] = ["HP", "FP", "stamina"];
const STAT_KEYS: StatKey[] = [
  "vigor",
  "mind",
  "endurance",
  "strength",
  "dexterity",
  "intelligence",
  "faith",
  "arcane",
];

function getLabel(key: SortKey): string {
  if (key in DERIVED_LABELS) return DERIVED_LABELS[key as DerivedStatKey];
  return STAT_LABELS[key as StatKey];
}

export function RankingTable() {
  const [level, setLevel] = useAtom(selectedLevelAtom);
  const [sortKey, setSortKey] = useAtom(sortKeyAtom);
  const [sortDirection, setSortDirection] = useAtom(sortDirectionAtom);
  const [characterFilter, setCharacterFilter] = useAtom(characterFilterAtom);
  const [allNames] = useAtom(allCharacterNamesAtom);
  const ranked = useRankedCharacters();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isFilterActive = characterFilter.length < allNames.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const allColumns: SortKey[] = [...DERIVED_KEYS, ...STAT_KEYS];

  const columnExtremes = allColumns.reduce(
    (acc, key) => {
      const values = ranked.map((e) => getStatValue(e.stats, e.derived, key));
      acc[key] = { max: Math.max(...values), min: Math.min(...values) };
      return acc;
    },
    {} as Record<SortKey, { max: number; min: number }>,
  );

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ""}`}>
      <div className={styles.controls}>
        <button
          className={styles.fullscreenBtn}
          onClick={() => setIsFullscreen((f) => !f)}
          title={isFullscreen ? "全画面解除" : "全画面表示"}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </button>
        <label className={styles.levelControl}>
          <span>Lv.</span>
          <input
            type="range"
            min={MIN_LEVEL}
            max={MAX_LEVEL}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
          <span className={styles.levelValue}>{level}</span>
        </label>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={styles.headerRow}>
            <div className={`${styles.rankCol} ${styles.headerCell}`}>#</div>
            <CharacterFilterTh
              allNames={allNames}
              selected={characterFilter}
              onChange={setCharacterFilter}
              isActive={isFilterActive}
            />
            {allColumns.map((key) => (
              <div
                key={key}
                className={`${styles.headerCell} ${sortKey === key ? styles.activeSort : ""}`}
                onClick={() => handleSort(key)}
              >
                {getLabel(key)}
                {sortKey === key &&
                  (sortDirection === "desc" ? (
                    <ArrowDropDown className={styles.sortArrow} />
                  ) : (
                    <ArrowDropUp className={styles.sortArrow} />
                  ))}
              </div>
            ))}
          </div>
          {ranked.map((entry, idx) => (
            <CharacterRow
              key={`${entry.character.name}-${idx}`}
              entry={entry}
              allColumns={allColumns}
              columnExtremes={columnExtremes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CharacterRow({
  entry,
  allColumns,
  columnExtremes,
}: {
  entry: RankedEntry;
  allColumns: SortKey[];
  columnExtremes: Record<SortKey, { max: number; min: number }>;
}) {
  return (
    <div className={styles.row}>
      <div className={`${styles.rankCell} ${styles.bodyCell}`}>
        {entry.rank}
      </div>
      <div className={`${styles.nameCell} ${styles.bodyCell}`}>
        <span className={styles.characterName}>{entry.character.name}</span>
        <span className={styles.relicLabelText} title={entry.relicLabel}>
          {entry.relicLabel.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </span>
        {entry.hasApproximateRelics && (
          <WarningAmber
            className={styles.approxIcon}
            titleAccess="遺物効果はレベル別データ未掲載のため概算値です"
          />
        )}
      </div>
      {allColumns.map((key) => {
        const val = getStatValue(entry.stats, entry.derived, key);
        const { max, min } = columnExtremes[key];
        const isMax = val === max && max !== min;
        const isMin = val === min && max !== min;
        return (
          <div
            key={key}
            className={`${styles.statCell} ${styles.bodyCell} ${isMax ? styles.maxVal : ""} ${isMin ? styles.minVal : ""}`}
          >
            {val}
          </div>
        );
      })}
    </div>
  );
}

function CharacterFilterTh({
  allNames,
  selected,
  onChange,
  isActive,
}: {
  allNames: string[];
  selected: string[];
  onChange: (names: string[]) => void;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const selectAll = () => onChange([...allNames]);
  const deselectAll = () => onChange([]);

  const selectedSet = new Set(selected);

  return (
    <div ref={ref} className={`${styles.nameCol} ${styles.headerCell}`}>
      <span className={styles.filterTrigger} onClick={() => setOpen((o) => !o)}>
        キャラクター
        {isActive ? (
          <FilterAlt className={styles.filterIconActive} />
        ) : (
          <FilterAltOutlined className={styles.filterIcon} />
        )}
      </span>
      {open && (
        <div className={styles.filterBackdrop} onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className={styles.filterPopover}>
          <div className={styles.filterActions}>
            <button onClick={selectAll} className={styles.filterActionBtn}>
              全選択
            </button>
            <button onClick={deselectAll} className={styles.filterActionBtn}>
              全解除
            </button>
          </div>
          {allNames.map((name) => (
            <label key={name} className={styles.filterItem}>
              <input
                type="checkbox"
                checked={selectedSet.has(name)}
                onChange={() => toggle(name)}
              />
              <span>{name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
