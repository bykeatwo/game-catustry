# 🔧 TROUBLESHOOTING Guide — Debugging & Problem Solving

> **For AI Agents**: Load this document when encountering errors or unexpected behavior.

---

## 📋 Quick Diagnostic Flow

```
1. Identify the error or unexpected behavior
2. Check the relevant domain logic (src/domain/)
3. Trace data flow: input → use-case → GameStore → render
4. Add/run a Vitest test to reproduce
5. Fix and verify
```

---

## 🎮 Game-Specific Issues

### ❌ Energy not regenerating

**Symptom**: Energy drains on work but never recovers.

**Solution**: Confirm `regenEnergy(state.production, delta)` is called every frame in `GameScene.update`, with `delta` (ms) passed from Phaser. Verify the regen math in `src/domain/energy.ts`.

### ❌ Sprites overlapping incorrectly (wrong depth sort)

**Symptom**: A tile/facility that should be behind another renders in front.

**Solution**: Depth must equal the isometric screen `y`. In `GameScene`, sprites set `setDepth(y)`; tiles use `isoToScreen(...).y`. Verify `isoToScreen` in `src/presentation/iso.ts` and that nothing overrides depth after creation.

### ❌ Merchant shop won't open

**Symptom**: Standing on the merchant tile shows no "Trade" prompt.

**Solution**: Verify the merchant tile exists (generated at `MERCHANT_POS = {x:4, y:4}` by `src/domain/mapgen.ts`) and that `GameScene.update` hits the `target?.kind === 'merchant'` branch **before** the buy-land branch. Also confirm `index.html` contains the `#shop` overlay and `MerchantUI` was constructed in `create()`.

### ❌ Buy/sell actions have no effect

**Symptom**: Clicking seed/inventory buttons does nothing.

**Solution**: Check the `ActionResult` reason. `buySeed` returns `NOT_DISCOVERED` or `INSUFFICIENT_COINS`; `sellItem` returns `NOT_ENOUGH`. Log the result in `store.buySeed` / `store.sellItem`.

---

## 💾 Persistence Issues

### ❌ Save doesn't persist after refresh

**Symptom**: Progress resets on page reload.

**Solution**: Check `localStorage` for key `catustry-save`. Confirm autosave is wired in `GameScene.create` (debounced subscriber + 5 s periodic `time.addEvent`), and that `loadState()` is used in `GameScene.init` (`new GameStore(loadState() ?? createInitialState())`).

### ❌ Save rejected on load (deserialize returns null)

**Symptom**: A previously valid save no longer loads.

**Solution**: `deserialize` rejects when the parsed `version !== SCHEMA_VERSION` or when `world`/`production` are missing. If you change the shape of `GameState`, bump `SCHEMA_VERSION` and add a `migrate` path in `src/domain/save.ts`. Corrupt/invalid JSON also returns `null` (falls back to a fresh state).

---

## 🧱 Type / Build Issues

### ❌ `tsc --noEmit` fails

**Symptom**: `npm run build` fails at the type-check step.

**Solution**: Run `npx tsc --noEmit` directly to see all errors. Common causes: importing Phaser inside `src/domain/` (violates the layering rule), or a mismatched `ActionResult`/`BuyResult` shape.

---

## 🧪 Testing

- Add a Vitest file per domain module (e.g. `test/mapgen.test.ts`).
- Reproduce a bug as a failing test first, then fix.
- Run `npm test` after every change.

---

## ⚠️ Common Pitfalls

| Pitfall | Cause | Prevention |
|---|---|---|
| Phaser import leaks into `domain/` | Screen logic added to rules | Keep `domain/` Phaser-free; render in `presentation/` |
| Merchant treatable as land | `buyLand` not gated on tile kind | Merchant branch is checked before buy-land in `GameScene.update` |
| Wild/ruin overwritten on land buy | `buyLand` sets `kind = 'grass'` | Accept for MVP; revisit if resources must persist |
| Save grows unbounded | Tile array serialized in full | Accept for MVP; may need delta/compression later |

---

## 📚 References

- Design spec: `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
- Architecture & constants: `docs/ARCHITECTURE.md`
- Development patterns: `docs/DEVELOPMENT.md`
- Deployment: `docs/DEPLOYMENT.md`