export function isoToScreen(gx: number, gy: number, tw: number, th: number) {
  return { x: (gx - gy) * (tw / 2), y: (gx + gy) * (th / 2) };
}

export function screenToIso(sx: number, sy: number, tw: number, th: number) {
  return {
    gx: (sx / (tw / 2) + sy / (th / 2)) / 2,
    gy: (sy / (th / 2) - sx / (tw / 2)) / 2
  };
}