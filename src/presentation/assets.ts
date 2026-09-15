// ============================================================
// GAME ASSETS - Texture Key Reference for Replacement
// ============================================================
// This file documents all asset keys used in the game.
// Replace procedural textures with actual sprites in assets/ folder.
// ============================================================

export const ASSETS = {
  // === TERRAIN ===
  tiles: {
    // Grass variations (3 versions for visual variety)
    grass: ['iso-grass-0', 'iso-grass-1', 'iso-grass-2'],
    // Unowned/unexplored land (dark gray)
    unowned: 'iso-unowned',
    // Water (if implemented in future)
    water: 'iso-water-0',
    // Ruins (before building)
    ruin: 'iso-ruin',
    // Merchant base tile
    merchant: 'iso-merchant'
  },

  // === CATS ===
  cat: {
    // Idle frames (2 per facing direction)
    idle: {
      side: ['cat-idle-side-0', 'cat-idle-side-1'],
      down: ['cat-idle-down-0', 'cat-idle-down-1'],
      up: ['cat-idle-up-0', 'cat-idle-up-1']
    },
    // Walk cycle (4 frames per direction)
    walk: {
      side: ['cat-side-0', 'cat-side-1', 'cat-side-2', 'cat-side-3'],
      down: ['cat-down-0', 'cat-down-1', 'cat-down-2', 'cat-down-3'],
      up: ['cat-up-0', 'cat-up-1', 'cat-up-2', 'cat-up-3']
    },
    // Work/paw action
    work: ['cat-work-0', 'cat-work-1'],
    // Default fallback
    default: 'cat'
  },

  // === CROPS ===
  crops: {
    wheat: ['crop-wheat-0', 'crop-wheat-1', 'crop-wheat-2'],
    carrot: ['crop-carrot-0', 'crop-carrot-1', 'crop-carrot-2'],
    potato: ['crop-potato-0', 'crop-potato-1', 'crop-potato-2'],
    egg: ['crop-egg-0', 'crop-egg-1', 'crop-egg-2']
  },

  // === FACILITIES ===
  facilities: {
    mill: ['fac-mill', 'fac-mill-work'],
    bakery: ['fac-bakery', 'fac-bakery-work'],
    gourmet: ['fac-gourmet', 'fac-gourmet-work']
  },

  // === ENTITIES ===
  entities: {
    ruin: 'entity-ruin',
    merchant: 'entity-merchant',
    emptyPlot: 'plot-empty'
  },

  // === PARTICLES ===
  particles: {
    sparkle: 'sparkle',  // harvest
    dust: 'dust',        // build
    star: 'star'         // levelup
  }
} as const;

// ============================================================
// REPLACEABLE ASSETS - Source files and locations
// ============================================================
// 
// FILES TO REPLACE:
// 1. assets/textures/ - PNG sprite sheets
// 2. assets/sprites/ - Individual sprite frames (if using texture atlases)
// 3. assets/music/ - ambient.ogg/mp3
// 4. assets/sfx/ - tap.ogg, harvest.ogg, gather.ogg, build.ogg, levelup.ogg, close.ogg, coin.ogg, footstep.ogg
//
// TEXTURE GENERATION:
// - textures.ts: makeTileTextures(), makeCropTextures(), makeFacilityTextures(), makeEntityTextures()
// - catSprite.ts: makeCatTextures()
// - particles.ts: textures generated in init() methods
//
// TEXTURE KEYS TO MATCH:
// - All keys in ASSETS.TILES, ASSETS.CAT, ASSETS.CROPS, etc.
//
// ============================================================

export {};