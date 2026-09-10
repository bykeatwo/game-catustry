# Cat's Food Chain Farm — Updated MVP Spec v0.3

**New systems added:** Player Level, Upgrade Medals (Guild Shop), and Tools & Gear.

---

## 04a · Player Level System (NEW)

Player level gates the maximum stat level achievable via medals.

### How to gain XP
- Each tap → +1 XP
- Completing production → bonus XP based on item tier (Raw +3, Processed +8, Crafted +20, Gourmet +60)
- Selling items → small XP based on value
- Guild contribution → XP rewards

### Level & Stat Cap Progression

| Player Level | XP Required | Max Stat Level per Stat | Unlocks |
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

> **Hard cap:** No stat can exceed player level. A Lv 3 player cannot have Speed Lv 4, even if they own enough medals.

---

## 04b · Upgrade Medals — Guild Shop (NEW)

Medals are consumable items bought from the **Guild Shop** using guild contribution points. Each medal applies +1 level to one stat, **capped at player level**.

### Medal Types

| Medal | Cost (Contribution Points) | Effect |
|---|---|---|
| **Medal of Swiftness** | 200 | +1 Speed level (cannot exceed player level) |
| **Medal of Vigor** | 200 | +1 Stamina level (cannot exceed player level) |
| **Medal of Brilliance** | 300 | +1 Quality level (cannot exceed player level) |

### How It Works

```
Player Lv 5, Speed currently Lv 3
  → Buys Medal of Swiftness → Speed becomes Lv 4 ✓
  → Buys Medal of Swiftness → Speed becomes Lv 5 ✓ (at cap)
  → Buys Medal of Swiftness → REJECTED: "Reach Player Lv 6 first"
  → Player levels up to Lv 6
  → Buys Medal of Swiftness → Speed becomes Lv 6 ✓
```

### Earning Contribution Points
- Tapping guild shared facilities → +2 per tap
- Donating coins to guild treasury → 1 point per 10 coins
- Donating crafted items → points based on tier & value
- Participating in guild bulk trades → bonus points
- Weekly guild activity bonus for active members

### Guild Shop Inventory
- Medals are **always in stock** (unlimited)
- Price scales slightly with guild level: Lv 1 guild = base price, Lv 3 guild = −10%, Lv 5 guild = −20%
- **Personal-only:** Medals bind to the buyer — cannot trade or sell to other players

---

## 04c · Tools & Gear System (NEW)

Equippable items that provide **production bonuses** or **quality chance boosts**. Each tool occupies a gear slot and targets specific production types or facilities.

### Gear Slots (3 total)

| Slot | Purpose | Example Items |
|---|---|---|
| **Tool** | Production speed / tap efficiency | Golden Trowel, Master Rolling Pin, Precision Knife |
| **Accessory** | Quality proc chance | Lucky Cat Collar, Gem-encrusted Paw Ring, Chef's Hat |
| **Uniform** | Stamina efficiency / energy cost reduction | Farmer Apron, Baker's Coat, Gourmet Robe |

### Tool Examples

| Tool | Slot | Target | Bonus | Cost / Source |
|---|---|---|---|---|
| **Garden Trowel** | Tool | Farm plots | −1 tap on all Raw crops | Shop: 500 coins |
| **Golden Trowel** | Tool | Farm plots | −2 taps on Raw + 5% extra yield | Rare drop / Guild shop: 800 pts |
| **Master Rolling Pin** | Tool | Mill / Bakery | −3 taps on Processed & Crafted | Crafted: requires Lv 5 + materials |
| **Precision Knife** | Tool | Fish / Meat processing | −2 taps + 3% quality chance | Shop: 1,200 coins |
| **Gourmet Whisk** | Tool | Gourmet Studio | −5 taps on Gourmet recipes | Guild shop: 1,500 pts, Guild Lv 3+ |

### Accessory Examples

| Accessory | Slot | Bonus | Cost / Source |
|---|---|---|---|
| **Lucky Cat Collar** | Accessory | +2% quality chance on all production | Shop: 800 coins |
| **Gem Paw Ring** | Accessory | +4% quality chance on final tap | Crafted: rare gem + gold |
| **Chef's Hat** | Accessory | +3% quality for Crafted & Gourmet only | Guild shop: 600 pts |
| **Four-leaf Clover Charm** | Accessory | +1.5% Perfect-tier chance specifically | Rare drop from Gourmet crafts |

### Uniform Examples

| Uniform | Slot | Bonus | Cost / Source |
|---|---|---|---|
| **Farmer Apron** | Uniform | −1 energy cost per Raw tap | Shop: 600 coins |
| **Baker's Coat** | Uniform | −1 energy cost per Processed/Crafted tap | Crafted: Lv 4 unlock |
| **Gourmet Robe** | Uniform | −2 energy cost per Gourmet tap | Guild shop: 1,200 pts |
| **Stamina Vest** | Uniform | +10% max energy pool (stacks with stat) | Shop: 2,000 coins |

### Gear Mechanics

- **Equip one per slot** — Tool, Accessory, Uniform
- **Bonuses stack** with stats and each other (additive unless noted)
- **No durability** for MVP — gear is permanent once acquired
- **Sellable** — can sell back to shop for 50% coin value (medals are consumed, not resellable)
- **Visual indicator** — equipped gear changes cat sprite appearance slightly (hat, tool in paw, etc.)

### Stacking Example

```
Player: Lv 6, Speed Lv 5
Tool:   Master Rolling Pin (−3 taps)
Uniform: Baker's Coat (−1 energy/tap)

Crafting Bread (base 22 taps, 4 energy/tap):
  → Speed Lv 5: 22 × (1 − 0.07×5) = 22 × 0.65 = 15 taps
  → Tool bonus: 15 − 3 = 12 taps total
  → Energy per tap: 4 − 1 = 3 energy
  → Total energy: 12 × 3 = 36 energy
  
  vs. naked Lv 1 player: 22 taps × 4 energy = 88 energy
```

---

## Updated Data Models

### `players:{uuid}` — additions
```json
{
  "id": "uuid-v4-auto",
  "name": "Guest_Cat_8F3A",
  "level": 5,
  "xp": 820,
  "xpToNext": 1200,
  "coins": 150,
  "contributionPoints": 450,
  "stats": {
    "speed": 4,
    "stamina": 3,
    "quality": 2,
    "energy": 100,
    "maxEnergy": 145
  },
  "gear": {
    "tool": "master_rolling_pin",
    "accessory": "lucky_collar",
    "uniform": "bakers_coat"
  },
  "inventory": {
    "wheat": 5,
    "medal_swiftness": 2,
    "garden_trowel": 1
  },
  "facilities": [ ... ],
  "guildId": "g_whisker_union",
  "production": [ ... ]
}
```

### `guilds:{id}` — additions
```json
{
  "id": "g_whisker_union",
  "name": "Whisker Union",
  "level": 3,
  "shop": {
    "medal_swiftness":  { "cost": 180, "discount": 0.1 },
    "medal_vigor":      { "cost": 180, "discount": 0.1 },
    "medal_brilliance": { "cost": 270, "discount": 0.1 },
    "gourmet_whisk":    { "cost": 1350, "discount": 0.1, "requiresGuildLevel": 3 }
  },
  ...
}
```

---

## New API Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/guilds/:id/shop` | List guild shop items & prices |
| `POST` | `/api/guilds/:id/shop/buy` | Buy medal or gear using contribution points |
| `POST` | `/api/medals/use` | Consume a medal to boost a stat (validates player level cap) |
| `POST` | `/api/gear/equip` | Equip gear to a slot |
| `POST` | `/api/gear/unequip` | Unequip gear back to inventory |
| `GET` | `/api/shop` | List regular coin shop items (tools, uniforms) |
| `POST` | `/api/shop/buy` | Buy gear with coins |

### Use Medal Request
`POST /api/medals/use`
```json
{
  "medalType": "medal_swiftness",
  "stat": "speed"
}
```

**Response — success**
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

**Response — blocked by level cap**
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

## Progression Loop (Updated)

```
Tap to produce → gain XP & coins → level up → raises stat cap
       ↑                                            ↓
       └── buy medals from guild shop ────────────┘
       └── buy tools/gear from shops ─────────────┘
       
Guild contribution points → unlock better gear in guild shop
```

### Player Decision Points
- Spend coins on **facilities** (unlock tiers) or **gear** (better production)?
- Spend contribution points on **medals** (permanent stat growth) or **exclusive tools** (big one-time bonus)?
- Which stat to medal first when player level raises the cap?
- Equip gear for **fewer taps** (Speed-focused) or **better quality** (Quality-focused)?
