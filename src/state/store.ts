import { GameState } from '../domain/types';
import { movePlayer, buyLand as buyLandFn, BuyResult } from '../domain/world';

type Listener = () => void;

export class GameStore {
  private state: GameState;
  private listeners = new Set<Listener>();

  constructor(initial: GameState) { this.state = initial; }

  getState(): GameState { return this.state; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void { this.listeners.forEach(fn => fn()); }

  move(gx: number, gy: number): void {
    movePlayer(this.state.world, gx, gy);
    this.notify();
  }

  buyLand(gx: number, gy: number): BuyResult {
    const r = buyLandFn(this.state, gx, gy);
    if (r.ok) this.notify();
    return r;
  }
}