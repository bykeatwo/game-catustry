import { GameStore } from '../state/store';
import { CropId } from '../domain/types';
import { errorMessage } from './messages';

const CROP_EMOJI: Record<string, string> = {
  wheat: '🌾', carrot: '🥕', potato: '🥔', egg: '🥚'
};

export class PlantUI {
  private root = document.getElementById('plant')!;
  private optsEl = document.getElementById('plant-options')!;
  private statusEl = document.getElementById('plant-status')!;
  private plotIndex = -1;

  constructor(private store: GameStore) {
    document.getElementById('plant-close')!.addEventListener('click', () => this.close());
    this.store.subscribe(() => { if (this.isOpen()) this.render(); });
  }

  isOpen(): boolean { return this.root.style.display === 'block'; }
  open(plotIndex: number): void { this.plotIndex = plotIndex; this.root.style.display = 'block'; this.render(); }
  close(): void { this.root.style.display = 'none'; this.plotIndex = -1; this.statusEl.textContent = ''; }

  private render(): void {
    const p = this.store.getState().production;
    const seeds = Object.entries(p.seeds).filter(([, q]) => (q ?? 0) > 0) as [string, number][];
    this.optsEl.innerHTML = seeds.length
      ? seeds.map(([id, q]) => `<button data-crop="${id}">${CROP_EMOJI[id] ?? ''} Plant ${id} ×${q}</button>`).join('')
      : '<p style="color:#888;">No seeds. Buy some from the merchant (🏪) first!</p>';

    this.optsEl.querySelectorAll('button[data-crop]').forEach(b => b.addEventListener('click', () => {
      const r = this.store.plantCrop(this.plotIndex, b.getAttribute('data-crop')! as CropId);
      if (r.ok) {
        this.close();
      } else {
        this.statusEl.textContent = errorMessage(r.reason);
      }
    }));
  }
}