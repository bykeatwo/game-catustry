import { Howl } from 'howler';

// Define sound categories
type SfxType = 'tap' | 'harvest' | 'gather' | 'build' | 'levelup' | 'close';

// Strong typing for our audio assets
interface SoundAssets {
  sfx: Record<SfxType, Howl>;
  muted: boolean;
}

// Initialize the audio manager with all sounds
export const audio: SoundAssets = {
  sfx: {
    tap: new Howl({
      src: ['assets/sfx/tap.mp3', 'assets/sfx/tap.ogg'],
      volume: 0.7
    }),
    harvest: new Howl({
      src: ['assets/sfx/harvest.mp3', 'assets/sfx/harvest.ogg'],
      volume: 0.6
    }),
    gather: new Howl({
      src: ['assets/sfx/gather.mp3', 'assets/sfx/gather.ogg'],
      volume: 0.6
    }),
    build: new Howl({
      src: ['assets/sfx/build.mp3', 'assets/sfx/build.ogg'],
      volume: 0.8
    }),
    levelup: new Howl({
      src: ['assets/sfx/levelup.mp3', 'assets/sfx/levelup.ogg'],
      volume: 1.0
    }),
    close: new Howl({
      src: ['assets/sfx/close.mp3', 'assets/sfx/close.ogg'],
      volume: 0.5
    })
  },
  muted: false
};

export function initAudio(): void {
  // Preload all sounds
}

export function mute(isMuted: boolean): void {
  audio.muted = isMuted;
  if (isMuted) {
    Object.values(audio.sfx).forEach(sfx => sfx.mute());
  }
}

export function playSfx(type: SfxType): void {
  if (audio.muted) return;
  audio.sfx[type].play();
}

export function playSfxWithVolume(type: SfxType, volume: number): void {
  if (audio.muted) return;
  audio.sfx[type].volume(volume);
  audio.sfx[type].play();
}

// Music management
export class BGMManager {
  private current: Howl | null = null;

  play(src: string, loop = true, volume = 0.5): void {
    if (this.current) {
      this.current.stop();
    }
    this.current = new Howl({
      src: [src],
      loop,
      volume,
      autoplay: !audio.muted
    });
  }

  stop(): void {
    if (this.current) {
      this.current.stop();
      this.current = null;
    }
  }

  fadeOut(duration: number): void {
    if (this.current) {
      this.current.fade(1, 0, duration);
    }
  }
}

export const bgm = new BGMManager();