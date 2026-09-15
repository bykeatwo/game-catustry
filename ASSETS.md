# Game Assets - Replacement Guide

This document identifies all visual elements that could be replaced with higher-quality assets.

## Currently Replaced Assets (Ready for Professional Art)

### 1. Cat Character (`catSprite.ts`)
**Status:** ✅ Implemented with animation
**Keys:** `cat`, `cat-idle-*`, `cat-walk-*`, `cat-work-*`
**What to replace:** The procedural chibi cat sprite with hand-drawn pixel art

### 2. Terrain Tiles (`textures.ts` - makeTileTextures)
**Status:** ✅ Implemented with textured tiles
**Keys:** `iso-grass-0/1/2`, `iso-unowned`, `iso-water-*`
**What to replace:** Grass variations with detailed tileset, water with animated texture

### 3. Crops (`textures.ts` - makeCropTextures)
**Status:** ✅ Implemented with growth stages
**Keys:** `crop-{wheat,carrot,potato,egg}-0/1/2`
**What to replace:** Procedurally drawn crops with pixel art sprites

### 4. Facilities (`textures.ts` - makeFacilityTypes)
**Status:** ✅ Implemented
**Keys:** `fac-{mill,bakery,gourmet}`, `fac-{mill,bakery,gourmet}-work`
**What to replace:** Minimal facility sprites with detailed building art

### 5. Entity Sprites (`textures.ts` - makeEntityTextures)
**Status:** ✅ Implemented
**Keys:** `entity-ruin`, `entity-merchant`, `plot-empty`
**What to replace:** Simple geometric shapes with proper sprites

### 6. Audio (`scripts/gen-audio.mjs`)
**Status:** ✅ Generated from synthesis
**Files:** `assets/sfx/*.ogg/mp3`, `assets/music/ambient.*`
**What to replace:** Synthesized sounds with professional SFX recordings

## Gray Box / Icon Elements (Need Sprite Replacement)

### 1. ITEM_EMOJI (`GameScene.ts` lines 24-31)
**Type:** HUDD Text-based items
**Currently shows:** 🍞, 🥕, etc.
**Keys needed:** `item-{name}` textures
**Age:** Critical UI element - should be sprites for consistency

### 2. CROP_EMOJI (`PlantUI.ts`)
**Type:** Plant selection buttons
**Currently shows:** 🌾, 🥕, 🥔, 🥚
**Keys:** `crop-{name}` already exist for growing crops - could reuse
**Age:** Medium priority - plant UI needs visual consistency

### 3. Emoji in HTML Templates
**Files:** `MerchantUI.ts` (🏪 🪙 🌰), `PlantUI.ts` (💰)
**Type:** Direct HTML with emoji
**Solution:** Replace with sprite images in HTML/CSS

### 4. HUD/Inventory Display (`GameScene.ts` - refreshHUD)
**Type:** Text-based coin, energy, level display
**Currently uses:** Pure text with emoji separators
**Age:** Lower priority - functional but could have icons

### 5. Float Text (`GameScene.ts` - floatText)
**Type:** Action feedback popups
**Currently uses:** Text with farm emoji
**Age:** Medium - could use simple sprites

## How to Replace Assets

### Step 1: Texture Replacement
Place new textures in `assets/textures/` (if using texture atlases) or the existing structure:
- Same key names as in `textures.ts` generate functions
- Example: `assets/textures/cat-sprite.png` → update `makeCatTextures()`

### Step 2: Audio Replacement
Replace files in `assets/sfx/` and `assets/music/`:
- Keep same filenames (tap.ogg, harvest.ogg, etc.)
- Same keys used in `audioManager.ts`

### Step 3: UI Icon Replacement
For emoji in UI:
- Replace with `<img src="..." class="item-icon">` elements
- Or use CSS background-image with sprite sheet

## Asset Keys Summary

| Element | Texture Key | Status |
|---------|-------------|--------|
| Cat (default) | `cat` | ✅ |
| Cat idle (side) | `cat-idle-side-0/1` | ✅ |
| Cat walk (side) | `cat-side-0..3` | ✅ |
| Grass (variations) | `iso-grass-0/1/2` | ✅ |
| Unowned land | `iso-unowned` | ✅ |
| Crop wheat | `crop-wheat-0/1/2` | ✅ |
| Crop carrot | `crop-carrot-0/1/2` | ✅ |
| Crop potato | `crop-potato-0/1/2` | ✅ |
| Crop egg | `crop-egg-0/1/2` | ✅ |
| Mill facility | `fac-mill`, `fac-mill-work` | ✅ |
| Bakery facility | `fac-bakery`, `fac-bakery-work` | ✅ |
| Gourmet facility | `fac-gourmet`, `fac-gourmet-work` | ✅ |
| Ruin entity | `entity-ruin` | ✅ |
| Merchant entity | `entity-merchant` | ⬅️ Replace with detailed stall |
| Empty plot | `plot-empty` | ⬅️ Could be improved with soil texture |
| Particle sparkle | `sparkle` | ✅ |
| Particle dust | `dust` | ✅ |
| Particle star | `star` | ✅ |

## Important Notes

1. **Reusability**: The `crop-*` textures for grown crops could also serve as item icons in inventory/HUD
2. **Consistency**: All sprites should share the same visual style (isometric, chibi, pixel art, etc.)
3. **Size**: Sprite dimensions are defined in `GAMED_CONFIG` (64x32 tiles, 48x52 for crops, etc.)
4. **Animation**: Frames can be added by extending key names (e.g., `cat-walk-side-0` through `3`)