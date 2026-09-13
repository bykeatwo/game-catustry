const ACTION_ERRORS: Record<string, string> = {
  NO_ENERGY: 'Not enough energy ⚡',
  NO_SEED: 'No seed available',
  NO_RECIPE: 'No recipe set',
  MISSING_INPUTS: 'Missing ingredients',
  LEVEL_LOCKED: 'Need a higher level',
  INSUFFICIENT_COINS: 'Not enough coins 🪙',
  NOT_ENOUGH: 'Not enough items',
  NOT_DISCOVERED: 'Crop not discovered yet',
  EMPTY_PLOT: 'Plot is empty',
  NO_PLOT: 'No plot here',
  NO_RESOURCE: 'Nothing to gather',
  NO_RUIN: 'No ruin here',
  OCCUPIED: 'Space is occupied',
  BLOCKED: 'Cannot build here',
  OUT_OF_BOUNDS: 'Out of bounds',
  NOT_ADJACENT: 'Buy adjacent land first',
  ALREADY_OWNED: 'Already owned',
  NOT_PLANTABLE: 'Cannot plant here'
};

export function errorMessage(reason?: string): string {
  return reason ? (ACTION_ERRORS[reason] ?? reason) : 'Something went wrong';
}