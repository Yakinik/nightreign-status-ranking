import { atom } from 'jotai';
import type { Character, CharacterData, StatKey, DerivedStatKey } from './types';
import rawData from '../../../../data/data.json';

const characterData = rawData as unknown as CharacterData;

export const charactersAtom = atom<Character[]>(characterData.characters);

export const selectedLevelAtom = atom<number>(15);

export type SortKey = StatKey | DerivedStatKey;

export const sortKeyAtom = atom<SortKey>('HP');

export const sortDirectionAtom = atom<'desc' | 'asc'>('desc');

/** 表示対象キャラ名のセット。全キャラ選択 = フィルタなし */
const allCharacterNames = characterData.characters.map((c) => c.name);
export const characterFilterAtom = atom<string[]>(allCharacterNames);
export const allCharacterNamesAtom = atom(allCharacterNames);
