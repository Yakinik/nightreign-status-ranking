import type { StatKey } from '@/entities/character';

export const STAT_LABELS: Record<StatKey, string> = {
  vigor: '生命力',
  mind: '精神力',
  endurance: '持久力',
  strength: '筋力',
  dexterity: '技量',
  intelligence: '知力',
  faith: '信仰',
  arcane: '神秘',
};

export const DERIVED_LABELS = {
  HP: 'HP',
  FP: 'FP',
  stamina: 'スタミナ',
} as const;
