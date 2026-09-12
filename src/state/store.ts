import { GameState, CropId } from '../domain/types';
import { movePlayer, buyLand as buyLandFn, BuyResult } from '../domain/world';
import { workPlot as wp, workFacility as wf, plantCrop as pc, gatherWild as gw, buildFacility as bf, ActionResult } from '../domain/actions';

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

  private run<R extends ActionResult>(action: () => R): R {
    const r = action();
    if (r.ok) this.notify();
    return r;
  }
  workPlot(i: number): ActionResult { return this.run(() => wp(this.state, i)); }
  workFacility(i: number): ActionResult { return this.run(() => wf(this.state, i)); }
  plantCrop(i: number, crop: CropId): ActionResult { return this.run(() => pc(this.state, i, crop)); }
  gatherWild(gx: number, gy: number): ActionResult { return this.run(() => gw(this.state, gx, gy)); }
  buildFacility(gx: number, gy: number): ActionResult { return this.run(() => bf(this.state, gx, gy)); }
}