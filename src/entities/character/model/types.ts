export type StatKey =
  | 'vigor'
  | 'mind'
  | 'endurance'
  | 'strength'
  | 'dexterity'
  | 'intelligence'
  | 'faith'
  | 'arcane';

export type DerivedStatKey = 'HP' | 'FP' | 'stamina';

/** [level, vigor, mind, endurance, strength, dexterity, intelligence, faith, arcane] */
export type LevelRow = [number, number, number, number, number, number, number, number, number];

export interface StatValues {
  vigor: number;
  mind: number;
  endurance: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
}

export interface DerivedValues {
  HP: number;
  FP: number;
  stamina: number;
}

export interface Relic {
  name: string;
  diff?: Partial<StatValues>;
  diffByLevel?: Partial<StatValues>[];
}

export interface Character {
  name: string;
  levels: LevelRow[];
  relics: Relic[];
}

export interface CharacterData {
  metadata: {
    formulas: Record<string, string>;
    statKeys: StatKey[];
  };
  characters: Character[];
}
