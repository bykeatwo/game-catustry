import { GameState } from '../domain/types';
import { serialize, deserialize } from '../domain/save';

const KEY = 'catustry-save';

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? deserialize(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(s: GameState): void {
  try {
    localStorage.setItem(KEY, serialize(s));
  } catch {
    // ignore quota/serialization errors for MVP
  }
}