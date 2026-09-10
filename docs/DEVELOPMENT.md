# 💻 DEVELOPMENT Guide — Game Development Workflow

> **For AI Agents**: Load this document for game development tasks, coding patterns, and best practices based on IDEA.md.

---

## 🏗️ Architecture: Game-Centric

### Data Flow
```
User Action → Game State → Use Case → Repository → Persistence
     ↑                                                        ↓
     └────────── UI Update ← State Update ← Result ───────────┘
```

### Layer Responsibilities

| Layer | Location | What Goes Here |
|---|---|---|
| **Presentation** | `components/`, `features/*/presentation/` | UI, state management, input handlers |
| **Domain** | `domain/`, `features/*/domain/` | Game entities, use cases, business rules |
| **Data** | `data/`, `features/*/data/` | API clients, local storage, sync logic |

### Key Principles
- **Single source of truth**: Player document holds complete state
- **Unidirectional flow**: State changes flow in one direction
- **Predictable progression**: Level → cap increases, gear provides bonuses

---

## 📁 Recommended Project Structure

```
game-catustry/
├── app/                          # Game entry points, screens
│   ├── game/
│   │   ├── page.tsx              # Main game screen
│   │   └── components/           # Game-specific UI
│   └── ...
├── components/                   # Shared game components
├── features/                     # Feature modules
│   ├── player/
│   │   ├── presentation/         # Player UI, view model
│   │   ├── domain/              # Player entities, use cases
│   │   └── data/                # Player repository
│   ├── guild/
│   └── gear/
├── domain/                       # Core game entities, types
├── data/                         # Data layer, API clients
├── lib/                          # Utilities, helpers
└── docs/                         # This documentation
```

---

## 🎮 Core Game Systems Implementation

### 1. Player System

**Key Features:**
- Level progression with XP
- Stat management (speed, stamina, quality)
- Energy system

**Implementation Patterns:**
```typescript
// Domain entity
interface Player {
  level: number;
  xp: number;
  stats: { speed: number; stamina: number; quality: number };
  // ...
}

// Use case for leveling
class LevelUpUseCase {
  execute(player: Player): Player {
    if (this.canLevelUp(player)) {
      return {
        ...player,
        level: player.level + 1,
        xp: 0,
        xpToNext: this.getXpForLevel(player.level + 1)
      };
    }
    return player;
  }
  
  private canLevelUp(player: Player): boolean {
    return player.xp >= this.getXpForLevel(player.level);
  }
  
  private getXpForLevel(level: number): number {
    const xpTable = [0, 50, 150, 350, 700, 1200, 2000, 3200, 5000, 8000];
    return xpTable[level - 1] || 0;
  }
}
```

### 2. Production System

**Key Features:**
- Crop production with tap counts
- Tier-based XP rewards
- Energy consumption

**Implementation Patterns:**
```typescript
// Production calculation with gear
function calculateProduction(baseTaps: number, speed: number, toolBonus: number): number {
  // Speed reduces taps: each speed level gives 7% reduction
  const speedModifier = 1 - (0.07 * speed);
  const afterSpeed = Math.ceil(baseTaps * speedModifier);
  return Math.max(1, afterSpeed - toolBonus);
}
```

### 3. Guild System

**Key Features:**
- Contribution points
- Guild shop with medals and gear
- Guild level discounts

**Implementation Patterns:**
```typescript
// Guild shop item with discount
interface ShopItem {
  id: string;
  baseCost: number;
  discount: number;  // 0.0 to 0.2 based on guild level
  requiresGuildLevel?: number;
}

function calculateShopCost(item: ShopItem, guildLevel: number): number {
  let discount = 0;
  if (guildLevel >= 5) discount = 0.2;
  else if (guildLevel >= 3) discount = 0.1;
  
  return Math.floor(item.baseCost * (1 - discount));
}
```

### 4. Gear System

**Key Features:**
- 3 slots: Tool, Accessory, Uniform
- Stacking bonuses
- Visual indicators

**Implementation Patterns:**
```typescript
// Gear with stacking effects
interface Gear {
  id: string;
  slot: 'tool' | 'accessory' | 'uniform';
  effects: GearEffect[];
}

interface GearEffect {
  type: 'tap_reduction' | 'quality_bonus' | 'energy_reduction';
  value: number;
  target?: string;  // Optional: specific item type
}

// Apply gear bonuses
function applyGearEffects(baseStats: PlayerStats, gear: EquippedGear): ModifiedStats {
  return {
    ...baseStats,
    speed: baseStats.speed + (gear.uniform?.speedBonus || 0),
    // ... other stacked bonuses
  };
}
```

---

## ⚙️ State Management Pattern

### Game State Store
```typescript
class GameState {
  private player: Player;
  private ui: UIState;
  private listeners: Set<() => void> = new Set();

  // Actions
  tapCrop(cropId: string): void {
    const result = this.useCases.processTap(this.player, cropId);
    this.player = result.player;
    this.notify();
  }

  buyMedal(type: string): void {
    const result = this.useCases.buyMedal(this.player, type);
    if (result.success) {
      this.player = result.player;
      this.notify();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Domain Layer)
- Test business rules independently
- Mock repositories
- Verify edge cases (level caps, gear interactions)

```typescript
describe('MedalUseCase', () => {
  it('should reject medal use when at level cap', () => {
    const player = createPlayer({ level: 3, stats: { speed: 3 } });
    const result = useMedal(player, 'speed');
    expect(result.success).toBe(false);
    expect(result.error).toBe('LEVEL_CAP');
  });
});
```

### Integration Tests (Data Layer)
- Test API interactions
- Test storage persistence
- Test sync scenarios

---

## 📝 Development Workflow

```
1. Understand the feature from IDEA.md
2. Identify domain entities & use cases
3. Write domain tests first (TDD)
4. Implement use cases
5. Implement data layer
6. Build UI components
7. Test end-to-end flow
8. Document any deviations
```

---

## ⚡ Quick Commands

| Task | Command |
|---|---|
| Run tests | `npm test` |
| Start dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 📚 Key Resources

- **Game Spec**: `IDEA.md` (source of truth for all game mechanics)
- **Architecture**: `docs/ARCHITECTURE.md` (data models, systems overview)
- **API Design**: See API endpoints in ARCHITECTURE.md