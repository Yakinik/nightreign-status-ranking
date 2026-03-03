'use client';

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import {
  charactersAtom,
  selectedLevelAtom,
  sortKeyAtom,
  sortDirectionAtom,
  characterFilterAtom,
  getStatsAtLevel,
  applyRelics,
  calcDerived,
  getStatValue,
} from '@/entities/character';
import type { Character, StatValues, DerivedValues } from '@/entities/character';

export interface RankedEntry {
  character: Character;
  stats: StatValues;
  derived: DerivedValues;
  rank: number;
  relicLabel: string;
  hasApproximateRelics: boolean;
}

const RELIC_PATTERNS: { config: [boolean, boolean]; labelType: 'none' | 'a' | 'b' | 'ab' }[] = [
  { config: [false, false], labelType: 'none' },
  { config: [true, false], labelType: 'a' },
  { config: [false, true], labelType: 'b' },
  { config: [true, true], labelType: 'ab' },
];

export function useRankedCharacters(): RankedEntry[] {
  const characters = useAtomValue(charactersAtom);
  const level = useAtomValue(selectedLevelAtom);
  const sortKey = useAtomValue(sortKeyAtom);
  const sortDirection = useAtomValue(sortDirectionAtom);
  const characterFilter = useAtomValue(characterFilterAtom);

  return useMemo(() => {
    const filtered = characters.filter((c) => characterFilter.includes(c.name));

    const entries: RankedEntry[] = filtered.flatMap((character) => {
      const baseStats = getStatsAtLevel(character, level);
      return RELIC_PATTERNS.map((pattern) => {
        const stats = applyRelics(baseStats, character, pattern.config, level);
        const derived = calcDerived(stats);
        let label: string;
        switch (pattern.labelType) {
          case 'none': label = '遺物なし'; break;
          case 'a':    label = character.relics[0]?.name ?? '遺物A'; break;
          case 'b':    label = character.relics[1]?.name ?? '遺物B'; break;
          case 'ab':   label = `${character.relics[0]?.name ?? '遺物A'}\n${character.relics[1]?.name ?? '遺物B'}`; break;
        }
        const hasApproximateRelics = character.relics.some(
          (relic, i) => pattern.config[i] && !relic.diffByLevel,
        );
        return { character, stats, derived, rank: 0, relicLabel: label, hasApproximateRelics };
      });
    });

    entries.sort((a, b) => {
      const aVal = getStatValue(a.stats, a.derived, sortKey);
      const bVal = getStatValue(b.stats, b.derived, sortKey);
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });

    entries.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    return entries;
  }, [characters, level, sortKey, sortDirection, characterFilter]);
}
