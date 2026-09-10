# 🐱 Cat's Food Chain Farm — Game Development Project

> **For AI Agents**: This is your entry point. Read this file first to understand the game concept, then load the specific documentation for your current task.

---

## 🎮 Game Overview

**Cat's Food Chain Farm** is a mobile idle/tap game where players manage a farm, grow crops, process them into food, and progress through a tier-based economy. Players can join guilds, contribute to collective goals, and purchase stat-boosting medals and gear.

### Core Systems
- **Player Level & XP**: Tap to gain XP, level up to unlock facilities and increase stat caps
- **Production Chain**: Raw crops → Processed goods → Crafted items → Gourmet dishes
- **Guild System**: Join guilds, contribute to communal resources, shop for exclusive items
- **Upgrade Medals**: Consumable items that permanently boost player stats
- **Tools & Gear**: Equippable items that provide production bonuses and efficiency

---

## 📚 Documentation Map

| Task | Document to Load |
|---|---|
| 🏗️ **Architecture decisions**, data models, progression systems | `docs/ARCHITECTURE.md` |
| 💻 **Coding**, game mechanics, API endpoints, state management | `docs/DEVELOPMENT.md` |
| 🔧 **Agent setup**, dependencies, environment configuration | `docs/SETUP.md` |
| 📦 **Deployment**, APK building, distribution | `docs/DEPLOYMENT.md` |
| 🔧 **Problem solving**, debugging, common issues | `docs/TROUBLESHOOTING.md` |

---

## 🚦 Development Workflow

```
1. SETUP      → docs/SETUP.md (run once per environment)
2. DEVELOP    → docs/DEVELOPMENT.md (daily coding)
3. DEPLOY     → docs/DEPLOYMENT.md (when releasing)
4. TROUBLESHOOT → docs/TROUBLESHOOTING.md (when debugging)
```

---

## 🏗️ Key Features (from IDEA.md)

### Player Level System
- Gain XP through: tapping (+1), production completion (tier-based), item sales
- Level caps stats: Player LV 5 means max stat level is 5
- Unlocks: Mill (LV 3), Bakery (LV 5), Gourmet Studio (LV 9), Market Stall Lv 2 (LV 7)

### Guild Shop & Medals
- **Medal of Swiftness** (200 pts): +1 Speed
- **Medal of Vigor** (200 pts): +1 Stamina  
- **Medal of Brilliance** (300 pts): +1 Quality
- Medals are consumed on use, bind to buyer, scale with guild level

### Tools & Gear System
- **3 Gear Slots**: Tool, Accessory, Uniform
- Tools: Reduce taps (e.g., Golden Trowel, Master Rolling Pin)
- Accessories: Increase quality chance (e.g., Lucky Cat Collar)
- Uniforms: Reduce energy cost or increase pool (e.g., Farmer Apron)

### Production & Progression
- Tap crops → Harvest → Process → Craft → Gourmet
- Each tier gives bonus XP: Raw +3, Processed +8, Crafted +20, Gourmet +60
- Gear stacks additively with stats for optimized production

---

## 📁 Project Structure

```
game-catustry/
├── README.md                    ← YOU ARE HERE (entry point)
├── IDEA.md                      ← Core game specification (source of truth)
├── docs/
│   ├── ARCHITECTURE.md          ← Game systems & data models
│   ├── DEVELOPMENT.md           ← Game coding practices
│   ├── SETUP.md                 ← Environment setup for agents
│   ├── DEPLOYMENT.md            ← Build & release process
│   └── TROUBLESHOOTING.md       ← Problem solving for agents
└── ... (implementation files follow IDEA.md)
```

---

## ⚡ Quick Start for Development

```bash
# 1. Install deps (see docs/SETUP.md)
npm install

# 2. Run dev server
npm run dev

# 3. Build for deployment
npm run build

# 4. For APK builds (cloud via GitHub Actions)
git add . && git commit -m "feat: changes" && git push origin main
```

> **For full details on any step, load the corresponding document from `docs/`.**