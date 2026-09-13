export type ItemId =
  | 'wheat' | 'carrot' | 'potato' | 'egg'
  | 'flour' | 'carrot_juice' | 'mashed' | 'omelette'
  | 'bread' | 'carrot_cake' | 'crisps' | 'pie'
  | 'feast' | 'royal';

export type Tier = 'raw' | 'processed' | 'crafted' | 'gourmet';

export interface Item {
  id: ItemId;
  name: string;
  tier: Tier;
  taps: number;   // work-taps to complete production
  sell: number;   // coin value when sold
}

export type FacilityType = 'mill' | 'bakery' | 'gourmet';
export const FACILITY_SIZE = 2; // facilities occupy a 2x2 tile footprint (gx,gy = north-west corner)
export type CropId = 'wheat' | 'carrot' | 'potato' | 'egg';
export type RecipeId = Exclude<ItemId, CropId>;

export interface Recipe {
  output: ItemId;
  facility: FacilityType;
  level: number;                        // player level required
  inputs: Partial<Record<ItemId, number>>;
}

export interface Plot {
  id: string;
  gx: number;
  gy: number;
  crop: CropId | null;   // null = empty (nothing planted)
  progress: number;      // work-taps done toward the crop's taps
}

export interface Facility {
  id: string;
  gx: number;
  gy: number;
  type: FacilityType;
  recipe: RecipeId | null; // null = no recipe selected
  progress: number;
}

export type Inventory = Partial<Record<ItemId, number>>;

export interface ProductionState {
  coins: number;
  level: number;
  xp: number;
  energy: number;
  inventory: Inventory;
  seeds: Partial<Record<CropId, number>>;
  plots: Plot[];
  facilities: Facility[];
  discoveredCrops: CropId[];
}

export type TileKind = 'grass' | 'wild' | 'ruin' | 'merchant' | 'unowned';

export interface Tile {
  gx: number;
  gy: number;
  kind: TileKind;
  owned: boolean;
  resource?: CropId;      // present when kind === 'wild'
  ruinType?: FacilityType; // present when kind === 'ruin'
}

export interface WorldMap {
  width: number;
  height: number;
  tiles: Tile[];           // length = width * height, index = gy * width + gx
  player: { gx: number; gy: number };
}

export interface GameState {
  version: number;
  world: WorldMap;
  production: ProductionState;
}