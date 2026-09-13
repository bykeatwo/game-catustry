import { GameStore } from '../state/store';
import { ITEMS } from '../domain/items';
import { seedCost } from '../domain/economy';
import { CropId, ItemId } from '../domain/types';
import { errorMessage } from './messages';

export class MerchantUI {
  private root = document.getElementById('shop')!;
  private seedsEl = document.getElementById('shop-seeds')!;
  private sellEl = document.getElementById('shop-sell')!;
  private statusEl = document.getElementById('shop-status')!;

  constructor(private store: GameStore) {
    document.getElementById('shop-close')!.addEventListener('click', () => this.close());
    this.store.subscribe(() => { if (this.isOpen()) this.refresh(); });
  }

  isOpen(): boolean { return this.root.style.display === 'block'; }
  open(): void { this.statusEl.textContent = ''; this.refresh(); this.root.style.display = 'block'; }
  close(): void { this.root.style.display = 'none'; this.statusEl.textContent = ''; }

  private refresh(): void {
    const p = this.store.getState().production;
    this.seedsEl.innerHTML = p.discoveredCrops.length
      ? p.discoveredCrops.map(c => `<button data-seed="${c}">${c} seed — ${seedCost(c)}🪙</button>`).join('')
      : '<p style="color:#888;">No seeds available yet.</p>';
    const inv = Object.entries(p.inventory).filter(([, q]) => (q ?? 0) > 0) as [string, number][];
    this.sellEl.innerHTML = inv.length
      ? inv.map(([id, q]) => `<button data-sell="${id}">${ITEMS[id as ItemId].name} ×${q} — ${ITEMS[id as ItemId].sell}🪙</button>`).join('')
      : '<p style="color:#888;">Nothing to sell.</p>';

    this.seedsEl.querySelectorAll('button[data-seed]').forEach(b => b.addEventListener('click', () => {
      const r = this.store.buySeed(b.getAttribute('data-seed')! as CropId);
      if (!r.ok) this.statusEl.textContent = errorMessage(r.reason);
    }));
    this.sellEl.querySelectorAll('button[data-sell]').forEach(b => b.addEventListener('click', () => {
      const r = this.store.sellItem(b.getAttribute('data-sell')! as ItemId);
      if (!r.ok) this.statusEl.textContent = errorMessage(r.reason);
    }));
  }
}