import type { Character, Relic, StatKey, StatValues, DerivedValues } from '../model/types';
import type { SortKey } from '../model/atoms';

const STAT_INDEX: Record<StatKey, number> = {
  vigor: 1,
  mind: 2,
  endurance: 3,
  strength: 4,
  dexterity: 5,
  intelligence: 6,
  faith: 7,
  arcane: 8,
};

export function getStatsAtLevel(character: Character, level: number): StatValues {
  const row = character.levels.find((r) => r[0] === level);
  if (!row) throw new Error(`Level ${level} not found for ${character.name}`);
  return {
    vigor: row[1],
    mind: row[2],
    endurance: row[3],
    strength: row[4],
    dexterity: row[5],
    intelligence: row[6],
    faith: row[7],
    arcane: row[8],
  };
}

function getRelicDiff(relic: Relic, level: number): Partial<StatValues> {
  if (relic.diffByLevel) return relic.diffByLevel[level - 1];
  return relic.diff ?? {};
}

export function applyRelics(
  stats: StatValues,
  character: Character,
  config: [boolean, boolean],
  level: number,
): StatValues {
  const result = { ...stats };
  character.relics.forEach((relic, i) => {
    if (!config[i]) return;
    const diff = getRelicDiff(relic, level);
    for (const [key, value] of Object.entries(diff)) {
      result[key as StatKey] += value as number;
    }
  });
  return result;
}

export function calcDerived(stats: StatValues): DerivedValues {
  return {
    HP: 80 + stats.vigor * 20,
    FP: 45 + stats.mind * 5,
    stamina: 48 + stats.endurance * 2,
  };
}

export function getStatValue(stats: StatValues, derived: DerivedValues, key: SortKey): number {
  if (key === 'HP' || key === 'FP' || key === 'stamina') {
    return derived[key];
  }
  return stats[key];
}
