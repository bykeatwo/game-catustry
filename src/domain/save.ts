import { GameState } from './types';
import { createInitialState } from './state';

export const SCHEMA_VERSION = 1;

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

export function deserialize(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || parsed.version !== SCHEMA_VERSION) return null;
    if (!parsed.world || !parsed.production) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Migration hook: future schema versions convert old saves here.
export function migrate(raw: string): GameState | null {
  return deserialize(raw) ?? createInitialState();
}