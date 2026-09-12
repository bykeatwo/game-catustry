import { describe, it, expect, vi } from 'vitest';
import { GameStore } from '@/state/store';
import { createInitialState } from '@/domain/state';

describe('GameStore', () => {
  it('exposes initial state and notifies subscribers', () => {
    const store = new GameStore(createInitialState());
    const fn = vi.fn();
    store.subscribe(fn);
    store.move(4, 4);
    expect(store.getState().world.player).toEqual({ gx: 4, gy: 4 });
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('unsubscribe stops notifications', () => {
    const store = new GameStore(createInitialState());
    const fn = vi.fn();
    const unsub = store.subscribe(fn);
    unsub();
    store.move(2, 2);
    expect(fn).not.toHaveBeenCalled();
  });
});