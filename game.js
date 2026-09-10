/* ============================================================
   Cat's Food Chain Farm — Game Engine (vanilla JS, no deps)
   Source of truth: IDEA.md
   ============================================================ */

/* ----------------------- CONFIG / DATA ----------------------- */

const TIER_XP = { raw: 3, processed: 8, crafted: 20, gourmet: 60 };
const TIER_ENERGY = { raw: 2, processed: 3, crafted: 4, gourmet: 5 };

// XP needed to advance FROM each level (index 0 = Lv1 -> Lv2)
const XP_THRESHOLD = [50, 100, 200, 350, 500, 800, 1200, 1800, 3000];

// Facility unlock by level
const FACILITY_UNLOCK = {
  farm: 1, mill: 3, bakery: 5, market: 7, gourmet: 9
};

// Items: id -> meta
const ITEMS = {
  // Raw (farm)
  wheat:        { name: 'Wheat',        emoji: '🌾', tier: 'raw',       taps: 5,  sell: 3 },
  carrot:       { name: 'Carrot',       emoji: '🥕', tier: 'raw',       taps: 7,  sell: 5 },
  potato:       { name: 'Potato',       emoji: '🥔', tier: 'raw',       taps: 10, sell: 8 },
  egg:          { name: 'Egg',          emoji: '🥚', tier: 'raw',       taps: 6,  sell: 4 },
  // Processed (Mill, Lv3)
  flour:        { name: 'Flour',        emoji: '🥣', tier: 'processed', taps: 12, sell: 14 },
  carrot_juice: { name: 'Carrot Juice', emoji: '🥤', tier: 'processed', taps: 12, sell: 18 },
  mashed:       { name: 'Mashed Potato',emoji: '🍲', tier: 'processed', taps: 14, sell: 22 },
  omelette:     { name: 'Omelette',     emoji: '🍳', tier: 'processed', taps: 12, sell: 16 },
  // Crafted (Bakery, Lv5)
  bread:        { name: 'Bread',        emoji: '🍞', tier: 'crafted',   taps: 22, sell: 40 },
  carrot_cake:  { name: 'Carrot Cake',  emoji: '🍰', tier: 'crafted',   taps: 24, sell: 55 },
  crisps:       { name: 'Crisps',       emoji: '🍟', tier: 'crafted',   taps: 24, sell: 60 },
  pie:          { name: 'Pie',          emoji: '🥧', tier: 'crafted',   taps: 22, sell: 45 },
  // Gourmet (Studio, Lv9)
  feast:        { name: 'Gourmet Feast',emoji: '🍽️', tier: 'gourmet',   taps: 40, sell: 200 },
  royal:        { name: 'Royal Platter',emoji: '✨', tier: 'gourmet',   taps: 45, sell: 260 },
};

// Recipes: outputId -> { facility, level, inputs: {itemId: qty} }
const RECIPES = {
  flour:        { facility: 'mill',   level: 3, inputs: { wheat: 2 } },
  carrot_juice: { facility: 'mill',   level: 3, inputs: { carrot: 2 } },
  mashed:       { facility: 'mill',   level: 3, inputs: { potato: 2 } },
  omelette:     { facility: 'mill',   level: 3, inputs: { egg: 2 } },
  bread:        { facility: 'bakery', level: 5, inputs: { flour: 2 } },
  carrot_cake:  { facility: 'bakery', level: 5, inputs: { carrot_juice: 2 } },
  crisps:       { facility: 'bakery', level: 5, inputs: { mashed: 2 } },
  pie:          { facility: 'bakery', level: 5, inputs: { omelette: 2 } },
  feast:        { facility: 'gourmet',level: 9, inputs: { bread: 1, carrot_cake: 1 } },
  royal:        { facility: 'gourmet',level: 9, inputs: { crisps: 2, pie: 1 } },
};

// Craftable crops (farm) available from Lv1
const FARM_CROPS = ['wheat', 'carrot', 'potato', 'egg'];

// Medals
const MEDALS = {
  medal_swiftness:  { name: 'Medal of Swiftness',  emoji: '⚡', stat: 'speed',   cost: 200 },
  medal_vigor:      { name: 'Medal of Vigor',      emoji: '💪', stat: 'stamina', cost: 200 },
  medal_brilliance: { name: 'Medal of Brilliance', emoji: '✨', stat: 'quality', cost: 300 },
};

// Gear
const GEAR = {
  garden_trowel:      { name: 'Garden Trowel',      emoji: '🪴', slot: 'tool',      shop: 'coins', cost: 500,  fx: [{ type: 'tap', amt: 1, target: 'raw' }] },
  precision_knife:    { name: 'Precision Knife',    emoji: '🔪', slot: 'tool',      shop: 'coins', cost: 1200, fx: [{ type: 'tap', amt: 2, target: 'processed' }, { type: 'quality', amt: 3 }] },
  lucky_collar:       { name: 'Lucky Cat Collar',   emoji: '🔔', slot: 'accessory', shop: 'coins', cost: 800,  fx: [{ type: 'quality', amt: 2 }] },
  farmer_apron:       { name: 'Farmer Apron',       emoji: '👕', slot: 'uniform',   shop: 'coins', cost: 600,  fx: [{ type: 'energy', amt: 1, target: 'raw' }] },
  stamina_vest:       { name: 'Stamina Vest',       emoji: '🎽', slot: 'uniform',   shop: 'coins', cost: 2000, fx: [{ type: 'maxenergy', amt: 10 }] },
  golden_trowel:      { name: 'Golden Trowel',      emoji: '🌟', slot: 'tool',      shop: 'guild', cost: 800,  fx: [{ type: 'tap', amt: 2, target: 'raw' }, { type: 'yield', amt: 5 }] },
  chef_hat:           { name: "Chef's Hat",         emoji: '👒', slot: 'accessory', shop: 'guild', cost: 600,  fx: [{ type: 'quality', amt: 3, target: 'crafted' }, { type: 'quality', amt: 3, target: 'gourmet' }] },
  gourmet_robe:       { name: 'Gourmet Robe',       emoji: '👘', slot: 'uniform',   shop: 'guild', cost: 1200, fx: [{ type: 'energy', amt: 2, target: 'gourmet' }] },
  gourmet_whisk:      { name: 'Gourmet Whisk',      emoji: '🥄', slot: 'tool',      shop: 'guild', cost: 1500, level: 3, fx: [{ type: 'tap', amt: 5, target: 'gourmet' }] },
  clover_charm:       { name: 'Four-leaf Clover',    emoji: '🍀', slot: 'accessory', shop: 'drop',  cost: 0,   fx: [{ type: 'perfect', amt: 1.5 }] },
  master_pin:         { name: 'Master Rolling Pin', emoji: '🥖', slot: 'tool',      shop: 'coins', cost: 1800, level: 5, fx: [{ type: 'tap', amt: 3, target: 'processed' }, { type: 'tap', amt: 3, target: 'crafted' }] },
  bakers_coat:        { name: "Baker's Coat",       emoji: '🧥', slot: 'uniform',   shop: 'coins', cost: 1200, level: 4, fx: [{ type: 'energy', amt: 1, target: 'processed' }, { type: 'energy', amt: 1, target: 'crafted' }] },
};

const GEAR_DESC = {
  tap: v => `−${v} taps`, quality: v => `+${v}% quality`, energy: v => `−${v} energy/tap`,
  maxenergy: v => `+${v}% max energy`, yield: v => `+${v}% yield`, perfect: v => `+${v}% perfect`,
};

/* ----------------------- STATE ----------------------- */

const DEFAULT_STATE = () => ({
  name: 'Guest_Cat',
  level: 1,
  xp: 0,
  coins: 25,
  cp: 0,
  stats: { speed: 0, stamina: 0, quality: 0 },
  energy: 100,
  gear: { tool: null, accessory: null, uniform: null },
  inventory: {},   // itemId -> count
  ownedGear: {},   // gearId -> count
  plots: FARM_CROPS.map(c => ({ crop: c, progress: 0 })),
  guild: { name: 'Whisker Union', level: 1 },
});

let state = load() || DEFAULT_STATE();

function load() {
  try {
    const raw = localStorage.getItem('catustry-save');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function save() {
  try { localStorage.setItem('catustry-save', JSON.stringify(state)); } catch (e) {}
}

/* ----------------------- DERIVED HELPERS ----------------------- */

function cap() { return state.level; }
function xpToNext() { return state.level >= 10 ? Infinity : (XP_THRESHOLD[state.level - 1] || 0); }

function maxEnergy() {
  let m = 100 + state.stats.stamina * 15;
  const vest = state.gear.uniform === 'stamina_vest';
  if (vest) m = Math.round(m * 1.10);
  return m;
}

// Gear effects aggregated
function gearEffects() {
  const out = { tap: {}, energy: {}, quality: 0, qualityTarget: {}, maxenergy: 0, yield: 0, perfect: 0 };
  for (const slot of ['tool', 'accessory', 'uniform']) {
    const id = state.gear[slot];
    if (!id) continue;
    const g = GEAR[id];
    if (!g) continue;
    for (const f of g.fx) {
      if (f.type === 'tap') out.tap[f.target || 'all'] = (out.tap[f.target || 'all'] || 0) + f.amt;
      else if (f.type === 'energy') out.energy[f.target || 'all'] = (out.energy[f.target || 'all'] || 0) + f.amt;
      else if (f.type === 'quality' && f.target) out.qualityTarget[f.target] = (out.qualityTarget[f.target] || 0) + f.amt;
      else if (f.type === 'quality') out.quality += f.amt;
      else if (f.type === 'maxenergy') out.maxenergy += f.amt;
      else if (f.type === 'yield') out.yield += f.amt;
      else if (f.type === 'perfect') out.perfect += f.amt;
    }
  }
  return out;
}

// taps needed for an item given speed + gear
function tapsNeeded(item) {
  const base = item.taps;
  const speed = state.stats.speed;
  const fx = gearEffects();
  let t = Math.ceil(base * (1 - 0.07 * speed));
  const reduce = (fx.tap[item.tier] || 0) + (fx.tap.all || 0);
  t -= reduce;
  return Math.max(1, t);
}

// energy cost per tap for an item tier given gear
function energyPerTap(tier) {
  const fx = gearEffects();
  const base = TIER_ENERGY[tier];
  const reduce = (fx.energy[tier] || 0) + (fx.energy.all || 0);
  return Math.max(0, base - reduce);
}

// quality chance (percent) for a tier
function qualityChance(tier) {
  const fx = gearEffects();
  let p = state.stats.quality * 2; // +2% per quality level
  p += fx.quality;
  p += (fx.qualityTarget[tier] || 0);
  p += fx.perfect;
  return p;
}

/* ----------------------- CORE ACTIONS ----------------------- */

function gainXp(n) {
  state.xp += n;
  while (state.level < 10 && state.xp >= xpToNext()) {
    state.xp -= xpToNext();
    state.level++;
    levelUpFX();
  }
  if (state.level >= 10) state.xp = 0;
}

function spendEnergy(n) {
  if (state.energy < n) return false;
  state.energy -= n;
  return true;
}

function cost(n) { state.coins -= n; }

function addItem(id, qty = 1) {
  state.inventory[id] = (state.inventory[id] || 0) + qty;
  if (state.inventory[id] < 0) state.inventory[id] = 0;
}
function hasItem(id, qty = 1) { return (state.inventory[id] || 0) >= qty; }

function canAffordCoins(n) { return state.coins >= n; }
function canAffordCP(n) { return state.cp >= n; }

// Guild discount based on guild level
function guildDiscount() {
  return state.guild.level >= 5 ? 0.2 : state.guild.level >= 3 ? 0.1 : 0;
}
function guildPrice(baseCost) {
  return Math.floor(baseCost * (1 - guildDiscount()));
}

/* ----------------------- FARM ----------------------- */

function farmTap(plotIndex) {
  const plot = state.plots[plotIndex];
  if (!plot) return;
  const item = ITEMS[plot.crop];
  const energy = energyPerTap('raw');
  if (!spendEnergy(energy)) { toast('Not enough energy! ⚡'); return; }

  gainXp(1);
  plot.progress++;

  const needed = tapsNeeded(item);
  if (plot.progress >= needed) {
    // harvest
    let qty = 1;
    const fx = gearEffects();
    if (Math.random() < fx.yield / 100) qty = 2; // yield bonus
    addItem(item.id, qty);
    gainXp(TIER_XP.raw);
    plot.progress = 0;
    toast(`Harvested ${item.emoji} ${item.name}${qty > 1 ? ' x2!' : '!'}`);
    sfx('harvest');
  } else {
    sfx('tap');
  }
  spawnFloat(plotIndex);
  render();
}

/* ----------------------- KITCHEN ----------------------- */

function craftTap(outputId) {
  const item = ITEMS[outputId];
  if (!item) return;
  const recipe = RECIPES[outputId];
  if (!recipe) return;
  if (state.level < recipe.level) { toast(`Need Player Lv ${recipe.level}`); return; }

  const energy = energyPerTap(item.tier);
  if (!spendEnergy(energy)) { toast('Not enough energy! ⚡'); return; }

  gainXp(1);
  craftProcess[outputId] = (craftProcess[outputId] || 0) + 1;

  const needed = tapsNeeded(item);
  if (craftProcess[outputId] >= needed) {
    // consume inputs, produce output
    for (const [inp, qty] of Object.entries(recipe.inputs)) {
      if (!hasItem(inp, qty)) { craftProcess[outputId] = 0; toast('Missing ingredients!'); render(); return; }
    }
    for (const [inp, qty] of Object.entries(recipe.inputs)) addItem(inp, -qty);

    let gain = 1;
    const qc = qualityChance(item.tier);
    let isQuality = false;
    if (Math.random() < qc / 100) { isQuality = true; gain = 2; }

    addItem(outputId, gain);
    gainXp(TIER_XP[item.tier]);
    craftProcess[outputId] = 0;
    if (isQuality) { toast(`✨ Quality ${item.name}!`); sfx('quality'); }
    else { toast(`Made ${item.emoji} ${item.name}${gain > 1 ? ' x2' : ''}!`); sfx('harvest'); }
    maybeRareDrop(item.tier);
  } else {
    sfx('tap');
  }
  render();
}

let craftProcess = {}; // outputId -> progress

// rare drop chance on gourmet production
function maybeRareDrop(tier) {
  if (tier !== 'gourmet') return;
  const chance = 0.04; // 4%
  if (Math.random() < chance) {
    const pool = []; // clover is a rare drop per IDEA
    if (!state.ownedGear.clover_charm) pool.push('clover_charm');
    if (pool.length && Math.random() < 0.5) {
      state.ownedGear[pool[0]] = 1;
      toast('🍀 Rare drop! Four-leaf Clover Charm!');
      sfx('quality');
    }
  }
}

/* ----------------------- GUILD ----------------------- */

function donate(coinsAmount) {
  if (!canAffordCoins(coinsAmount)) { toast('Not enough coins!'); return; }
  cost(coinsAmount);
  const pts = Math.floor(coinsAmount / 10);
  state.cp += pts;
  gainXp(pts); // guild contribution XP
  toast(`Donated ${coinsAmount}🪙 → +${pts} 🏅`);
  sfx('tap');
  render();
}

function buyMedal(medalId) {
  const m = MEDALS[medalId];
  if (!m) return;
  const price = guildPrice(m.cost);
  if (!canAffordCP(price)) { toast('Not enough 🏅!'); return; }
  if (state.stats[m.stat] >= cap()) { toast(`Reach Player Lv ${state.level + 1} first! 🔒`); return; }
  state.cp -= price;
  state.stats[m.stat]++;
  toast(`${m.emoji} ${m.stat} → ${state.stats[m.stat]}!`);
  sfx('level');
  render();
}

function buyGear(gearId) {
  const g = GEAR[gearId];
  if (!g) return;
  const isGuild = g.shop === 'guild';
  const price = isGuild ? guildPrice(g.cost) : g.cost;
  if (g.level && state.level < g.level) { toast(`Unlocks at Player Lv ${g.level}`); return; }
  if (g.shop === 'guild' && state.guild.level < (g.level || 0)) { toast(`Needs Guild Lv ${g.level}`); return; }

  if (isGuild) { if (!canAffordCP(price)) { toast('Not enough 🏅!'); return; } state.cp -= price; }
  else { if (!canAffordCoins(price)) { toast('Not enough 🪙!'); return; } cost(price); }

  state.ownedGear[gearId] = (state.ownedGear[gearId] || 0) + 1;
  toast(`Bought ${g.emoji} ${g.name}!`);
  sfx('harvest');
  render();
}

function equipGear(gearId) {
  const g = GEAR[gearId];
  if (!g) return;
  if (!state.ownedGear[gearId]) { toast('You do not own this!'); return; }
  // put current equipped back to owned
  const cur = state.gear[g.slot];
  if (cur) state.ownedGear[cur] = (state.ownedGear[cur] || 0) + 1;
  state.gear[g.slot] = gearId;
  state.ownedGear[gearId]--;
  if (state.ownedGear[gearId] <= 0) delete state.ownedGear[gearId];
  toast(`Equipped ${g.emoji} ${g.name}!`);
  sfx('tap');
  render();
}

function unequip(slot) {
  const id = state.gear[slot];
  if (!id) return;
  state.ownedGear[id] = (state.ownedGear[id] || 0) + 1;
  state.gear[slot] = null;
  toast('Unequipped');
  render();
}

/* ----------------------- SELL ----------------------- */

function sellItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return;
  if (!hasItem(itemId)) return;
  addItem(itemId, -1);
  state.coins += item.sell;
  gainXp(Math.max(1, Math.floor(item.sell / 5)));
  toast(`Sold ${item.emoji} for ${item.sell}🪙`);
  sfx('tap');
  render();
}

/* ----------------------- SOUND (WebAudio) ----------------------- */

let audioCtx = null;
function sfx(kind) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const freq = kind === 'tap' ? 440 : kind === 'harvest' ? 660 : kind === 'quality' ? 880 : 523;
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.setValueAtTime(0.08, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    o.start(); o.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

/* ----------------------- FX ----------------------- */

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

function spawnFloat(plotIndex) {
  const plots = document.querySelectorAll('.plot');
  if (!plots[plotIndex]) return;
  const r = plots[plotIndex].getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'float';
  f.textContent = '+1 XP';
  f.style.left = (r.left + r.width / 2 - 20) + 'px';
  f.style.top = (r.top) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

function levelUpFX() {
  const el = document.getElementById('levelUp');
  const txt = document.getElementById('levelUpText');
  const unlocks = [];
  if (state.level === 3) unlocks.push('Mill facility');
  if (state.level === 5) unlocks.push('Bakery facility');
  if (state.level === 7) unlocks.push('Market Stall Lv 2');
  if (state.level === 9) unlocks.push('Gourmet Studio');
  if (state.level === 10) unlocks.push('All content');
  txt.textContent = unlocks.length
    ? `Unlocked: ${unlocks.join(', ')}`
    : `You reached Level ${state.level}!`;
  el.classList.remove('hidden');
  sfx('level');
}

/* ----------------------- RENDER ----------------------- */

function el(id) { return document.getElementById(id); }

function render() {
  // HUD
  el('playerName').textContent = state.name;
  el('levelBadge').textContent = 'Lv ' + state.level;
  el('coins').textContent = state.coins;
  el('cp').textContent = state.cp;
  el('energy').textContent = state.energy;
  el('energyMax').textContent = '/' + maxEnergy();

  const need = xpToNext();
  el('xpFill').style.width = (Math.min(1, state.xp / need) * 100) + '%';
  el('xpText').textContent = `${state.xp} / ${need} XP`;

  el('statSpeed').textContent = state.stats.speed + '/' + cap();
  el('statStamina').textContent = state.stats.stamina + '/' + cap();
  el('statQuality').textContent = state.stats.quality + '/' + cap();

  el('guildName').textContent = state.guild.name;
  el('guildLevel').textContent = 'Guild Lv ' + state.guild.level;

  renderFarm();
  renderKitchen();
  renderGuild();
  renderGear();
  save();
}

function renderFarm() {
  const wrap = el('farmPlots');
  wrap.innerHTML = state.plots.map((plot, i) => {
    const item = ITEMS[plot.crop];
    const needed = tapsNeeded(item);
    const pct = Math.min(100, (plot.progress / needed) * 100);
    return `<div class="plot" data-plot="${i}">
      <span class="crop">${item.emoji}</span>
      <div class="pname">${item.name}</div>
      <div class="prog"><div style="width:${pct}%"></div></div>
      <div class="ptaps">${plot.progress}/${needed} taps · ${energyPerTap('raw')}⚡/tap</div>
      <button class="sel" data-crop="${i}">change</button>
    </div>`;
  }).join('');

  el('invFarm').innerHTML = renderInventory('raw');
}

function renderKitchen() {
  const wrap = el('recipes');
  const facilityName = { mill: 'Mill', bakery: 'Bakery', gourmet: 'Gourmet Studio' };
  wrap.innerHTML = Object.entries(RECIPES).map(([outId, r]) => {
    const item = ITEMS[outId];
    const locked = state.level < r.level;
    const missing = Object.entries(r.inputs).filter(([id, q]) => !hasItem(id, q));
    const progress = craftProcess[outId] || 0;
    const needed = tapsNeeded(item);
    const ins = Object.entries(r.inputs).map(([id, q]) =>
      `${ITEMS[id].emoji}${q}${hasItem(id, q) ? '' : '❌'}`).join(' ');
    const pct = Math.min(100, (progress / needed) * 100);
    return `<div class="recipe ${locked ? 'locked' : ''}">
      <div class="recipe-head">
        <span class="facility">${facilityName[r.facility]} · Lv${r.level}</span>
        <span class="req">${locked ? '🔒 Lv' + r.level : (missing.length ? 'Need ingredients' : 'Ready')}</span>
      </div>
      <div class="io">${ins} <span class="arrow">→</span> ${item.emoji} ${item.name}</div>
      <div class="prog" style="height:8px;background:#eee;border-radius:10px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;background:var(--accent);width:${pct}%"></div>
      </div>
      <button class="btn" data-craft="${outId}" ${locked ? 'disabled' : ''}>Produce (${progress}/${needed} · ${energyPerTap(item.tier)}⚡/tap)</button>
    </div>`;
  }).join('');

  el('invKitchen').innerHTML = renderInventory('all');
}

function renderInventory(filter) {
  const entries = Object.entries(state.inventory).filter(([id]) => state.inventory[id] > 0)
    .filter(([id]) => filter === 'all' || ITEMS[id].tier === filter);
  if (!entries.length) return '<div class="inv-item empty"><span class="e">📦</span><span class="n">Empty</span></div>';
  return entries.map(([id, qty]) => {
    const item = ITEMS[id];
    return `<div class="inv-item" data-sell="${id}">
      <span class="e">${item.emoji}</span>
      <span class="n">${item.name}</span>
      <span class="c">x${qty} · ${item.sell}🪙</span>
    </div>`;
  }).join('');
}

function renderGuild() {
  const medWrap = el('medals');
  medWrap.innerHTML = Object.entries(MEDALS).map(([id, m]) => {
    const price = guildPrice(m.cost);
    const atCap = state.stats[m.stat] >= cap();
    return `<div class="shop-item">
      <span class="e">${m.emoji}</span>
      <div class="info"><div class="n">${m.name}</div>
      <div class="d">${m.stat} ${state.stats[m.stat]}/${cap()}${atCap ? ' · capped 🔒' : ''}</div></div>
      <button class="btn" data-medal="${id}" ${atCap ? 'disabled' : ''}>${price}🏅</button>
    </div>`;
  }).join('');

  el('guildGear').innerHTML = Object.entries(GEAR).filter(([id, g]) => g.shop === 'guild')
    .map(([id, g]) => {
      const price = guildPrice(g.cost);
      const locked = g.level && state.guild.level < g.level;
      return `<div class="shop-item">
        <span class="e">${g.emoji}</span>
        <div class="info"><div class="n">${g.name}</div>
        <div class="d">${describeGear(g)}${locked ? ` · Guild Lv${g.level}` : ''}</div></div>
        <button class="btn" data-gear="${id}" ${locked ? 'disabled' : ''}>${price}🏅</button>
      </div>`;
    }).join('');
}

function describeGear(g) {
  return g.fx.map(f => GEAR_DESC[f.type](f.amt) + (f.target ? ` (${f.target})` : '')).join(', ');
}

function renderGear() {
  const slots = { tool: 'Tool', accessory: 'Accessory', uniform: 'Uniform' };
  el('gearSlots').innerHTML = Object.entries(slots).map(([slot, label]) => {
    const id = state.gear[slot];
    const content = id
      ? `<span class="gear-e">${GEAR[id].emoji}</span>
         <div class="gear-info"><div class="n">${GEAR[id].name}</div><div class="d">${describeGear(GEAR[id])}</div></div>
         <button class="btn secondary" data-unequip="${slot}">✕</button>`
      : `<span class="slot-empty">— empty —</span>`;
    return `<div class="slot"><span class="label">${label}</span>${content}</div>`;
  }).join('');

  el('coinShop').innerHTML = Object.entries(GEAR).filter(([id, g]) => g.shop === 'coins')
    .map(([id, g]) => {
      const locked = g.level && state.level < g.level;
      const owned = state.ownedGear[id] || 0;
      return `<div class="shop-item">
        <span class="e">${g.emoji}</span>
        <div class="info"><div class="n">${g.name}</div>
        <div class="d">${describeGear(g)}${locked ? ` · Lv${g.level}` : ''}${owned ? ` · own ${owned}` : ''}</div></div>
        <button class="btn" data-gear="${id}" ${locked ? 'disabled' : ''}>${g.cost}🪙</button>
      </div>`;
    }).join('');

  const owned = Object.entries(state.ownedGear).filter(([id, q]) => q > 0);
  el('ownedGear').innerHTML = owned.length
    ? owned.map(([id, qty]) => {
        const g = GEAR[id];
        return `<div class="inv-item" data-equip="${id}">
          <span class="e">${g.emoji}</span><span class="n">${g.name}</span><span class="c">x${qty}</span>
        </div>`;
      }).join('')
    : '<div class="inv-item empty"><span class="e">🎒</span><span class="n">No gear</span></div>';
}

/* ----------------------- EVENTS ----------------------- */

function bind() {
  // tabs
  document.getElementById('nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + tab));
  });

  // stat chips → medal shortcut
  document.querySelector('.stats-row').addEventListener('click', (e) => {
    const chip = e.target.closest('.stat-chip');
    if (!chip) return;
    const stat = chip.dataset.stat;
    const medal = { speed: 'medal_swiftness', stamina: 'medal_vigor', quality: 'medal_brilliance' }[stat];
    const m = MEDALS[medal];
    const price = guildPrice(m.cost);
    // act as medal use
    if (!canAffordCP(price)) { toast(`Not enough 🏅 (need ${price})!`); return; }
    if (state.stats[stat] >= cap()) { toast(`Capped! Reach Lv ${state.level + 1} 🔒`); return; }
    state.cp -= price;
    state.stats[stat]++;
    toast(`${m.emoji} ${stat} → ${state.stats[stat]}!`);
    sfx('level');
    render();
  });

  // farm tap / crop change
  el('farmPlots').addEventListener('click', (e) => {
    const sel = e.target.closest('.sel');
    if (sel) {
      const i = +sel.dataset.crop;
      const cur = FARM_CROPS.indexOf(state.plots[i].crop);
      state.plots[i].crop = FARM_CROPS[(cur + 1) % FARM_CROPS.length];
      state.plots[i].progress = 0;
      render();
      return;
    }
    const plot = e.target.closest('.plot');
    if (plot) farmTap(+plot.dataset.plot);
  });

  // kitchen craft
  el('recipes').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-craft]');
    if (btn) craftTap(btn.dataset.craft);
  });

  // sell (both inventories)
  el('content').addEventListener('click', (e) => {
    const it = e.target.closest('[data-sell]');
    if (it) sellItem(it.dataset.sell);
  });

  // guild
  el('donate10').addEventListener('click', () => donate(10));
  el('donate100').addEventListener('click', () => donate(100));
  el('medals').addEventListener('click', (e) => { const b = e.target.closest('[data-medal]'); if (b) buyMedal(b.dataset.medal); });
  el('guildGear').addEventListener('click', (e) => { const b = e.target.closest('[data-gear]'); if (b) buyGear(b.dataset.gear); });

  // gear
  el('coinShop').addEventListener('click', (e) => { const b = e.target.closest('[data-gear]'); if (b) buyGear(b.dataset.gear); });
  el('gearSlots').addEventListener('click', (e) => { const b = e.target.closest('[data-unequip]'); if (b) unequip(b.dataset.unequip); });
  el('ownedGear').addEventListener('click', (e) => { const b = e.target.closest('[data-equip]'); if (b) equipGear(b.dataset.equip); });

  // level up close
  el('levelUpClose').addEventListener('click', () => el('levelUp').classList.add('hidden'));

  // energy regen loop
  setInterval(() => {
    if (state.energy < maxEnergy()) {
      state.energy = Math.min(maxEnergy(), state.energy + 1);
      el('energy').textContent = state.energy;
      el('energyMax').textContent = '/' + maxEnergy();
    }
  }, 500); // 2 energy / sec

  // autosave periodically
  setInterval(save, 5000);
}

/* ----------------------- BOOT ----------------------- */

bind();
render();