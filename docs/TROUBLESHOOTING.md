# 🔧 TROUBLESHOOTING Guide — Debugging & Problem Solving

> **For AI Agents**: Load this document when encountering errors, validation failures, or unexpected behavior during game development.

---

## 📋 Quick Diagnostic Flow

```
1. Identify the error or unexpected behavior
2. Check relevant domain rules from IDEA.md
3. Trace data flow through layers
4. Apply solution
5. Verify with test
```

---

## 🎮 Game-Specific Issues

### ❌ Player Level Cap Not Enforced

**Symptom**: Stats can exceed player level

**Solution**: Verify the level cap check in medal use and gear application:
```typescript
// Correct: Check cap before applying
if (newStatLevel > player.level) {
  return { error: "LEVEL_CAP", message: "..." };
}
```

**Debug**: Add unit tests for max level edge cases

---

### ❌ Guild Shop Prices Not Scaling

**Symptom**: Guild level discounts not applied

**Solution**: Verify guild level discount logic:
```typescript
const discount = guild.level >= 5 ? 0.2 : 
                 guild.level >= 3 ? 0.1 : 0;
const finalCost = Math.floor(item.baseCost * (1 - discount));
```

**Debug**: Log guild level and calculated discount during purchases

---

### ❌ Gear Bonuses Not Stacking

**Symptom**: Equipped tools/accessories/uniforms don't affect production

**Solution**: Verify all bonus calculations are applied:
- Check that gear is actually equipped (in player state)
- Verify stacking formula: `finalValue = base × (1 + sum of all bonuses)`
- Test with no gear, partial gear, full gear

**Debug**: Log all modifier sources before final calculation

---

### ❌ Production Taps Not Reducing Correctly

**Symptom**: Tap count doesn't match expected value with speed gear

**Solution**: Verify speed calculation per IDEA.md spec:
- Each speed level = 7% reduction
- Formula: `taps × (1 - 0.07 × speed)`
- Apply tool bonuses after speed reduction

**Debug**: Log base taps, speed modifier, tool bonus, final count

---

## 🔄 Data Integrity Issues

### Potion: Invalid Player State

**Symptom**: Player stats are inconsistent with level

**Solution**: Add validation in state updates:
```typescript
function validatePlayerState(player: Player): ValidationResult {
  const maxStat = player.level;
  for (const stat of ['speed', 'stamina', 'quality']) {
    if (player.stats[stat] > maxStat) {
      return { valid: false, error: `STAT_OVER_CAP_${stat}` };
    }
  }
  return { valid: true };
}
```

---

### Potion: Medal Use on Wrong Stat

**Symptom**: Using medal_swiftness increases wrong stat

**Solution**: Verify stat mapping:
```typescript
const medalStatMap = {
  'medal_swiftness': 'speed',
  'medal_vigor': 'stamina',
  'medal_brilliance': 'quality'
};
```

**Debug**: Log mapped stat vs intended stat during use

---

## 🧪 Testing Strategies

### Unit Test Edge Cases
```typescript
describe('Level Cap', () => {
  it('rejects stat increase above level', () => {
    const player = { level: 5, stats: { speed: 5 } };
    expect(() => applyMedal(player, 'speed')).toThrow('LEVEL_CAP');
  });
  
  it('allows stat increase at cap', () => {
    const player = { level: 6, stats: { speed: 5 } };
    expect(applyMedal(player, 'speed')).toBeValid();
  });
});
```

### Integration Test Flows
1. Player earns XP → levels up → cap increases
2. Player buys medal → stat increases → respects new cap
3. Player equips gear → production improves

---

## 🛠️ Debugging Tools

### Console Logging Pattern
```typescript
function debugLog(context: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${context}:`, JSON.stringify(data, null, 2));
  }
}
```

### State Validation Hook
```typescript
// Use in development to catch state corruption
if (process.env.NODE_ENV === 'development') {
  validatePlayerState(currentPlayer);
}
```

---

## ⚠️ Common Pitfalls

| Pitfall | Cause | Prevention |
|---|---|---|
| Stats exceed level | Missing cap check | Validate on every stat change |
| Negative taps | Over-aggressive bonuses | Minimum 1 tap always |
| Medal stuck in inventory | Wrong item type | Verify medal ID format |
| Gear not equipping | Wrong slot type | Check slot availability |

---

## 📞 When to Seek Help

If you've tried:
1. Checking the relevant code against IDEA.md specs
2. Adding debug logging
3. Writing minimal reproduction test

Then consider:
- Documenting the edge case in code comments
- Updating tests to cover the scenario
- Recording as a known issue for future reference

---

## 📚 References

- Game mechanics: `IDEA.md`
- Data models: `docs/ARCHITECTURE.md`
- Implementation patterns: `docs/DEVELOPMENT.md`