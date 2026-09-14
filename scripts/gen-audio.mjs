// Synthesize game SFX + an ambient music loop, then encode to ogg/mp3 via ffmpeg.
// Run: node scripts/gen-audio.mjs
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SR = 44100;
const TWO_PI = Math.PI * 2;

const SFX_DIR = join(ROOT, 'assets', 'sfx');
const MUSIC_DIR = join(ROOT, 'assets', 'music');

function synth(duration, fn) {
  const n = Math.ceil(duration * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = fn(t);
  }
  // gentle normalize (soft clip)
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.95) {
    const g = 0.95 / peak;
    for (let i = 0; i < n; i++) out[i] *= g;
  }
  return out;
}

const noise = () => Math.random() * 2 - 1;
const sin = (f, t) => Math.sin(TWO_PI * f * t);

// ---- SFX definitions (name -> Float32Array samples) ----
const sfx = {
  // soft paw-tap: tiny click + low thump
  tap: synth(0.09, (t) =>
    sin(520, t) * Math.exp(-t * 45) * 0.5 + noise() * 0.06 * Math.exp(-t * 220)),
  // harvest "pop": bright upward chirp
  harvest: synth(0.2, (t) => {
    const f = 340 + (260 * t) / 0.2;
    const e = Math.exp(-t * 16);
    return sin(f, t) * e * 0.6 + sin(f * 2, t) * e * 0.18;
  }),
  // gather: soft rustle + gentle pluck
  gather: synth(0.28, (t) =>
    noise() * Math.exp(-t * 14) * 0.22 + sin(440, t) * Math.exp(-t * 9) * 0.28),
  // build: two hammer thunks
  build: synth(0.32, (t) => {
    let s = 0;
    for (const start of [0, 0.16]) {
      const tt = t - start;
      if (tt >= 0) {
        const e = Math.exp(-tt * 20);
        s += sin(135, tt) * e * 0.5 + noise() * Math.exp(-tt * 60) * 0.3;
      }
    }
    return s;
  }),
  // level-up: ascending C-E-G-C arpeggio
  levelup: synth(0.7, (t) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    let s = 0;
    notes.forEach((f, i) => {
      const tt = t - i * 0.13;
      if (tt >= 0) s += sin(f, tt) * Math.exp(-tt * 7) * 0.4;
    });
    return s;
  }),
  // close: quick downward click
  close: synth(0.06, (t) => {
    const f = 700 - (260 * t) / 0.06;
    return sin(f, t) * Math.exp(-t * 55) * 0.4;
  }),
  // coin: bright two-note "ching"
  coin: synth(0.16, (t) => {
    let s = 0;
    for (const [start, f] of [[0, 987.77], [0.06, 1318.51]]) {
      const tt = t - start;
      if (tt >= 0) s += sin(f, tt) * Math.exp(-tt * 22) * 0.4;
    }
    return s;
  }),
  // footstep: very soft, low thud
  footstep: synth(0.06, (t) => {
    const e = Math.exp(-t * 70);
    return sin(130, t) * e * 0.35 + noise() * 0.08 * e;
  })
};

// ---- Ambient music loop (16s, C — Am — F — G) ----
function musicLoop() {
  const chords = [
    [261.63, 329.63, 392.0], // C
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [196.0, 246.94, 293.66]  // G
  ];
  const chordDur = 4;
  const dur = 16;
  const n = dur * SR;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.floor(t / chordDur) % chords.length;
    const ct = t % chordDur;
    const chord = chords[ci];
    let s = 0;

    // warm pads (detuned pair per note)
    const env = Math.min(1, ct / 1.3) * Math.min(1, (chordDur - ct) / 1.5);
    for (const f of chord) {
      s += sin(f, t) * 0.09 * env;
      s += sin(f * 1.003, t) * 0.07 * env;
      s += sin(f * 0.5, t) * 0.04 * env; // sub octave warmth
    }

    // gentle arpeggio pluck (octave up)
    const step = Math.floor(ct / 1.0);
    const pt = ct - step;
    if (step < 4 && pt < 0.7) {
      const arp = chord[step % chord.length] * 2;
      const pe = Math.exp(-pt * 7);
      s += sin(arp, pt) * 0.13 * pe;
      s += sin(arp * 2, pt) * 0.05 * pe;
    }

    out[i] = s;
  }
  return out;
}

// ---- WAV writer (16-bit mono PCM) ----
function writeWav(path, samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  const writeStr = (off, s) => buf.write(s, off, 'ascii');
  writeStr(0, 'RIFF');
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits
  writeStr(36, 'data');
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

function encode(wav, name) {
  const ogg = join(SFX_DIR, `${name}.ogg`);
  const mp3 = join(SFX_DIR, `${name}.mp3`);
  execSync(`ffmpeg -y -loglevel error -i "${wav}" -codec:a libvorbis -qscale:a 5 "${ogg}"`);
  execSync(`ffmpeg -y -loglevel error -i "${wav}" -codec:a libmp3lame -b:a 128k "${mp3}"`);
  return { ogg, mp3 };
}

// ---- Run ----
mkdirSync(SFX_DIR, { recursive: true });
mkdirSync(MUSIC_DIR, { recursive: true });

const tmp = join(ROOT, '.audio-tmp');
mkdirSync(tmp, { recursive: true });

for (const [name, samples] of Object.entries(sfx)) {
  const wav = join(tmp, `${name}.wav`);
  writeWav(wav, samples);
  const out = encode(wav, name);
  console.log(`✓ ${name} → ${out.ogg} + ${out.mp3}`);
}

const wav = join(tmp, 'ambient.wav');
writeWav(wav, musicLoop());
execSync(`ffmpeg -y -loglevel error -i "${wav}" -codec:a libvorbis -qscale:a 5 "${join(MUSIC_DIR, 'ambient.ogg')}"`);
execSync(`ffmpeg -y -loglevel error -i "${wav}" -codec:a libmp3lame -b:a 128k "${join(MUSIC_DIR, 'ambient.mp3')}"`);
console.log(`✓ ambient → assets/music/ambient.{ogg,mp3}`);

execSync(`rm -rf "${tmp}"`);
console.log('Done.');