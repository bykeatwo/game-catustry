# 🏗️ ARCHITECTURE Guide — Game Systems & Data Models

> **For AI Agents**: Load this document to understand the game's architecture, data models, progression systems, and API design. Reference when building features following IDEA.md.

---

## 🎯 Game Overview

**Cat's Food Chain Farm** is an idle/tap game with a progression loop centered on:
- **Player leveling** through XP gains
- **Medal upgrades** via guild shop
- **Gear system** for production efficiency
- **Production chain** from raw to gourmet items

---

## 📊 Core Systems Architecture

### 1. Player Level System

Player level is the primary progression gate that limits stats and unlocks facilities.

#### Level Progression Table

| Player Level | XP Required | Max Stat Level | Unlocks |
|---|---|---|---|
| 1 | 0 | 1 | Basic farm plots |
| 2 | 50 | 2 | — |
| 3 | 150 | 3 | Mill facility |
| 4 | 350 | 4 | — |
| 5 | 700 | 5 | Bakery facility |
| 6 | 1,200 | 6 | — |
| 7 | 2,000 | 7 | Market Stall Lv 2 |
| 8 | 3,200 | 8 | — |
| 9 | 5,000 | 9 | Gourmet Studio |
| 10 | 8,000 | 10 | All content unlocked |

#### XP Gain Sources
- **Tap**: +1 XP per tap
- **Production completion**: Bonus XP based on item tier
  - Raw: +3 XP
  - Processed: +8 XP
  - Crafted: +20 XP
  - Gourmet: +60 XP
- **Selling items**: Small XP based on value
- **Guild contribution**: XP rewards

#### Hard Cap Rule
No stat can exceed player level. A Level 3 player cannot have Speed Level 4.

---

### 2. Upgrade Medals — Guild Shop

Consumable items that permanently boost player stats (capped at player level).

#### Medal Types

| Medal | Cost (Contribution Points) | Effect |
|---|---|---|
| **Medal of Swiftness** | 200 | +1 Speed level |
| **Medal of Vigor** | 200 | +1 Stamina level |
| **Medal of Brilliance** | 300 | +1 Quality level |

#### Usage Flow
```
Player Lv 5, Speed currently Lv 3
  → Buys Medal of Swiftness → Speed becomes Lv 4 ✓
  → Buys Medal of Swiftness → Speed becomes Lv 5 ✓ (at cap)
  → Buys Medal of Swiftness → REJECTED: "Reach Player Lv 6 first"
  → Player levels up to Lv 6
  → Buys Medal of Swiftness → Speed becomes Lv 6 ✓
```

#### Earning Contribution Points
- Tapping guild shared facilities → +2 per tap
- Donating coins → 1 point per 10 coins
- Donating crafted items → points based on tier & value
- Participating in guild bulk trades → bonus points
- Weekly guild activity bonus for active members

#### Guild Shop Features
- Medals **always in stock** (unlimited)
- Scales with guild level:
  - Base price at Lv 1 guild
  - -10% at Lv 3 guild
  - -20% at Lv 5 guild
- **Personal-only**: Cannot trade or sell

---

### 3. Tools & Gear System

Equippable items providing production bonuses or quality chances.

#### Gear Slots (3 total)

| Slot | Purpose | Examples |
|---|---|---|
| **Tool** | Production speed / tap efficiency | Golden Trowel, Master Rolling Pin |
| **Accessory** | Quality proc chance | Lucky Cat Collar, Gem Paw Ring |
| **Uniform** | Stamina efficiency / energy cost | Farmer Apron, Gourmet Robe |

#### Tool Examples

| Tool | Slot | Target | Bonus | Cost / Source |
|---|---|---|---|---|
| **Garden Trowel** | Tool | Farm plots | -1 tap on all Raw crops | Shop: 500 coins |
| **Golden Trowel** | Tool | Farm plots | -2 taps on Raw + 5% extra yield | Rare drop / Guild shop: 800 pts |
| **Master Rolling Pin** | Tool | Mill / Bakery | -3 taps on Processed & Crafted | Crafted: requires Lv 5 + materials |
| **Precision Knife** | Tool | Fish / Meat processing | -2 taps + 3% quality chance | Shop: 1,200 coins |
| **Gourmet Whisk** | Tool | Gourmet Studio | -5 taps on Gourmet recipes | Guild shop: 1,500 pts, Guild Lv 3+ |

#### Accessory Examples

| Accessory | Slot | Bonus | Cost / Source |
|---|---|---|---|
| **Lucky Cat Collar** | Accessory | +2% quality chance on all production | Shop: 800 coins |
| **Gem Paw Ring** | Accessory | +4% quality chance on final tap | Crafted: rare gem + gold |
| **Chef's Hat** | Accessory | +3% quality for Crafted & Gourmet only | Guild shop: 600 pts |
| **Four-leaf Clover Charm** | Accessory | +1.5% Perfect-tier chance (Gourmet only) | Rare drop from Gourmet crafts |

#### Uniform Examples

| Uniform | Slot | Bonus | Cost / Source |
|---|---|---|---|
| **Farmer Apron** | Uniform | -1 energy cost per Raw tap | Shop: 600 coins |
| **Baker's Coat** | Uniform | -1 energy cost per Processed/Crafted tap | Crafted: Lv 4 unlock |
| **Gourmet Robe** | Uniform | -2 energy cost per Gourmet tap | Guild shop: 1,200 pts |
| **Stamina Vest** | Uniform | +10% max energy pool | Shop: 2,000 coins |

#### Gear Mechanics
- **One item per slot** (Tool, Accessory, Uniform)
- **Bonuses stack** additively with stats and each other
- **No durability** — gear is permanent once acquired
- **Sellable** — 50% coin value back to shop (medals consumed on use, not resellable)
- **Visual indicator** — equipped gear changes cat sprite appearance

#### Stacking Example
```
Player: Lv 6, Speed Lv 5
Tool:   Master Rolling Pin (-3 taps)
Uniform: Baker's Coat (-1 energy/tap)

Crafting Bread (base 22 taps, 4 energy/tap):
  → Speed Lv 5: 22 × (1 - 0.07×5) = 22 × 0.65 = 15 taps
  → Tool bonus: 15 - 3 = 12 taps total
  → Energy per tap: 4 - 1 = 3 energy
  → Total energy: 12 × 3 = 36 energy
  
  vs. naked Lv 1 player: 22 taps × 4 energy = 88 energy
```

---

## 📦 Data Models

### Player Document

```typescript
interface Player {
  id: string;                    // uuid-v4-auto
  name: string;                  // e.g., "Guest_Cat_8F3A"
  level: number;                 // Current player level
  xp: number;                    // Current XP
  xpToNext: number;              // XP needed for next level
  coins: number;                 // Currency
  contributionPoints: number;    // Guild contribution points
  
  stats: {
    speed: number;               // Current speed level
    stamina: number;             // Current stamina level
    quality: number;             // Current quality level
    energy: number;              // Current energy
    maxEnergy: number;           // Max energy (can be boosted)
  };
  
  gear: {
    tool: string | null;         // Equipped tool ID
    accessory: string | null;    // Equipped accessory ID
    uniform: string | null;      // Equipped uniform ID
  };
  
  inventory: {
    [itemId: string]: number;    // Item counts
  };
  
  facilities: string[];          // Unlocked facilities
  guildId: string | null;        // Current guild
  production: ProductionTask[];  // Active production tasks
}
```

### Guild Document (Additions)

```typescript
interface Guild {
  id: string;                     // e.g., "g_whisker_union"
  name: string;
  level: number;                  // Guild level (affects discounts)
  shop: {
    [itemId: string]: {
      cost: number;              // Base cost (discounted by guild level)
      discount: number;          // Guild level discount (0.0 - 0.2)
      requiresGuildLevel?: number; // Minimum guild level requirement
    };
  };
  // ... other guild properties
}
```

---

## 🔌 API Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/guilds/:id/shop` | List guild shop items & prices |
| `POST` | `/api/guilds/:id/shop/buy` | Buy medal or gear using contribution points |
| `POST` | `/api/medals/use` | Consume a medal to boost a stat (validates level cap) |
| `POST` | `/api/gear/equip` | Equip gear to a slot |
| `POST` | `/api/gear/unequip` | Unequip gear back to inventory |
| `GET` | `/api/shop` | List regular coin shop items (tools, uniforms) |
| `POST` | `/api/shop/buy` | Buy gear with coins |
| `GET` | `/api/player/:id` | Get player state |
| `POST` | `/api/player/tap` | Process a tap (gain XP, energy usage) |
| `POST` | `/api/player/level` | Handle level up logic |

### Use Medal Request Example

**Request:**
```json
POST /api/medals/use
{
  "medalType": "medal_swiftness",
  "stat": "speed"
}
```

**Success Response:**
```json
{
  "success": true,
  "stat": "speed",
  "oldLevel": 4,
  "newLevel": 5,
  "playerLevel": 5,
  "statCap": 5,
  "medalsRemaining": 1
}
```

**Level Cap Response:**
```json
{
  "success": false,
  "error": "LEVEL_CAP",
  "message": "Speed is already at your player level cap (5). Reach Player Lv 6 to upgrade further.",
  "playerLevel": 5,
  "statCap": 5
}
```

---

## 🔄 Progression Loop

```
Tap to produce → gain XP & coins → level up → raises stat cap
       ↑                                            ↓
       └── buy medals from guild shop ────────────┘
       └── buy tools/gear from shops ─────────────┘
       
Guild contribution points → unlock better gear in guild shop
```

### Player Decision Points
- Spend coins on **facilities** (unlock tiers) or **gear** (production efficiency)?
- Spend contribution points on **medals** (permanent stat growth) or **exclusive tools** (one-time bonus)?
- Which stat to prioritize when player level raises the cap?
- Equip gear for **fewer taps** (Speed) or **better quality** (Quality)?

---

## 🛡️ Business Rules Summary

| Rule | Implementation |
|---|---|
| **Stat Cap** | Stats cannot exceed player level |
| **Medal Consumption** | Medals are consumed on use, not durably stored |
| **Gear Binding** | Guild shop items bind to buyer, cannot trade |
| **Gear Selling** | 50% coin value when sold back |
| **Guild Scaling** | Shop prices decrease with guild level |
| **Stacking** | All bonuses (stats, gear, medals) are additive |

---

## 📚 References

- Core specification: **`IDEA.md`**
- Development workflow: **`docs/DEVELOPMENT.md`**
- Setup: **`docs/SETUP.md`**
- Deployment: **`docs/DEPLOYMENT.md`**
- Troubleshooting: **`docs/TROUBLESHOOTING.md`**