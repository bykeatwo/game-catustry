import { CropId, FacilityType, Item, ItemId, Recipe, Tier } from './types';

export const ITEMS: Record<ItemId, Item> = {
  wheat:       { id: 'wheat',        name: 'Wheat',         tier: 'raw',       taps: 5,  sell: 3 },
  carrot:      { id: 'carrot',       name: 'Carrot',        tier: 'raw',       taps: 7,  sell: 5 },
  potato:      { id: 'potato',       name: 'Potato',        tier: 'raw',       taps: 10, sell: 8 },
  egg:         { id: 'egg',          name: 'Egg',           tier: 'raw',       taps: 6,  sell: 4 },
  flour:       { id: 'flour',        name: 'Flour',         tier: 'processed', taps: 12, sell: 14 },
  carrot_juice:{ id: 'carrot_juice', name: 'Carrot Juice',  tier: 'processed', taps: 12, sell: 18 },
  mashed:      { id: 'mashed',       name: 'Mashed Potato', tier: 'processed', taps: 14, sell: 22 },
  omelette:    { id: 'omelette',     name: 'Omelette',      tier: 'processed', taps: 12, sell: 16 },
  bread:       { id: 'bread',        name: 'Bread',         tier: 'crafted',   taps: 22, sell: 40 },
  carrot_cake: { id: 'carrot_cake',  name: 'Carrot Cake',   tier: 'crafted',   taps: 24, sell: 55 },
  crisps:      { id: 'crisps',       name: 'Crisps',        tier: 'crafted',   taps: 24, sell: 60 },
  pie:         { id: 'pie',          name: 'Pie',           tier: 'crafted',   taps: 22, sell: 45 },
  feast:       { id: 'feast',        name: 'Gourmet Feast', tier: 'gourmet',   taps: 40, sell: 200 },
  royal:       { id: 'royal',        name: 'Royal Platter', tier: 'gourmet',   taps: 45, sell: 260 }
};

export const RECIPES: Record<ItemId, Recipe> = {
  flour:        { output: 'flour',        facility: 'mill',    level: 3, inputs: { wheat: 2 } },
  carrot_juice: { output: 'carrot_juice', facility: 'mill',    level: 3, inputs: { carrot: 2 } },
  mashed:       { output: 'mashed',       facility: 'mill',    level: 3, inputs: { potato: 2 } },
  omelette:     { output: 'omelette',     facility: 'mill',    level: 3, inputs: { egg: 2 } },
  bread:        { output: 'bread',        facility: 'bakery',  level: 5, inputs: { flour: 2 } },
  carrot_cake:  { output: 'carrot_cake',  facility: 'bakery',  level: 5, inputs: { carrot_juice: 2 } },
  crisps:       { output: 'crisps',       facility: 'bakery',  level: 5, inputs: { mashed: 2 } },
  pie:          { output: 'pie',          facility: 'bakery',  level: 5, inputs: { omelette: 2 } },
  feast:        { output: 'feast',        facility: 'gourmet', level: 9, inputs: { bread: 1, carrot_cake: 1 } },
  royal:        { output: 'royal',        facility: 'gourmet', level: 9, inputs: { crisps: 2, pie: 1 } }
};

export const TIER_XP: Record<Tier, number> = { raw: 3, processed: 8, crafted: 20, gourmet: 60 };
export const TIER_ENERGY: Record<Tier, number> = { raw: 2, processed: 3, crafted: 4, gourmet: 5 };

// delta XP needed to advance FROM each level (index 0 = Lv1 -> Lv2)
export const XP_THRESHOLDS = [50, 100, 200, 350, 500, 800, 1200, 1800, 3000];
export const MAX_LEVEL = 10;

export const FACILITY_UNLOCK: Record<FacilityType, number> = { mill: 3, bakery: 5, gourmet: 9 };

export const BUILD_COSTS: Record<'farm' | FacilityType, number> = {
  farm: 50, mill: 100, bakery: 250, gourmet: 800
};

export const SEED_COSTS: Record<CropId, number> = { wheat: 5, carrot: 10, potato: 15, egg: 12 };