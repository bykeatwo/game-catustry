import { describe, it, expect } from 'vitest';
import { isoToScreen, screenToIso } from '@/presentation/iso';

describe('isoToScreen', () => {
  it('maps origin to origin center', () => {
    expect(isoToScreen(0, 0, 64, 32)).toEqual({ x: 0, y: 0 });
  });
  it('maps (1,0) to one step in +x', () => {
    expect(isoToScreen(1, 0, 64, 32)).toEqual({ x: 32, y: 16 });
  });
  it('maps (0,1) to one step in -x,+y', () => {
    expect(isoToScreen(0, 1, 64, 32)).toEqual({ x: -32, y: 16 });
  });
});

describe('screenToIso', () => {
  it('round-trips isoToScreen', () => {
    const s = isoToScreen(3, 5, 64, 32);
    expect(screenToIso(s.x, s.y, 64, 32)).toEqual({ gx: 3, gy: 5 });
  });
});