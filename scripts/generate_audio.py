#!/usr/bin/env python3
"""
Generate placeholder SFX for Cat's Food Chain Farm.
Creates simple sine wave sounds and converts to MP3/OGG.
"""
import wave
import struct
import subprocess
import os
import math

ASSETS_DIR = "/data/data/com.termux/files/home/game-catustry/assets"

def sine_wave(frequency, duration, sample_rate=44100, amplitude=0.5):
    """Generate a sine wave."""
    n_samples = int(sample_rate * duration)
    return [amplitude * math.sin(2 * math.pi * frequency * t / sample_rate) for t in range(n_samples)]

def save_wav(filename, samples, sample_rate=44100):
    """Save samples as WAV file."""
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(struct.pack('h', int(s * 32767)) for s in samples))

def generate_sfx(name, frequency, duration=0.2, decay=0.0):
    """Generate SFX with optional decay (simulating tail)."""
    # Attack-decay envelope (simple)
    sample_rate = 44100
    n = int(sample_rate * duration)
    
    envelope = [1.0] * n
    # Add quick decay for tail effect
    for i in range(int(n * 0.1), n):
        envelope[i] = 1.0 - (i - int(n * 0.1)) / (n * 0.9) * decay
    
    samples = sine_wave(frequency, duration, sample_rate)
    samples = [s * e for s, e in zip(samples, envelope)]
    
    wav_path = os.path.join(ASSETS_DIR, "sfx", f"{name}.wav")
    mp3_path = os.path.join(ASSETS_DIR, "sfx", f"{name}.mp3")
    ogg_path = os.path.join(ASSETS_DIR, "sfx", f"{name}.ogg")
    
    save_wav(wav_path, samples, sample_rate)
    print(f"Generated: {wav_path}")
    
    # Convert to MP3 and OGG using ffmpeg
    for out_path in [mp3_path, ogg_path]:
        subprocess.run([
            "ffmpeg", "-y", "-i", wav_path, 
            "-codec:a", "libmp3lame" if out_path.endswith('.mp3') else "libvorbis",
            out_path
        ], capture_output=True)
        if os.path.exists(out_path):
            print(f"Generated: {out_path}")
    
    os.remove(wav_path)  # Clean up intermediate WAV

def main():
    os.makedirs(os.path.join(ASSETS_DIR, "sfx"), exist_ok=True)
    os.makedirs(os.path.join(ASSETS_DIR, "music"), exist_ok=True)
    
    # SFX definitions: name, frequency (Hz), description
    sfx_list = [
        ("tap", 660, "short click/tap"),
        ("harvest", 523, "crop harvest chimed"),
        ("gather", 784, "wild resource collection"),
        ("build", 880, "facility construction"),
        ("levelup", 1047, "level advancement fanfare"),
        ("close", 440, "UI close sound"),
    ]
    
    for name, freq, desc in sfx_list:
        print(f"Generating {name} ({desc}) - {freq}Hz")
        generate_sfx(name, freq, duration=0.3, decay=0.6 if name in ["harvest", "build", "levelup"] else 0.0)
    
    print(f"\nAll SFX generated in {ASSETS_DIR}/sfx/")

if __name__ == "__main__":
    main()