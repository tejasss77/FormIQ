class VoiceCoach {
  private enabled: boolean = true;
  private volume: number = 0.9;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private cooldownMs: number = 5500; // 5.5 second cooldown between cues
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer crisp English voices
    const preferred = voices.find(
      (v) =>
        (v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Alex') ||
          v.name.includes('Google US English') ||
          v.name.includes('Natural')) &&
        v.lang.startsWith('en')
    );
    this.selectedVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public speak(text: string, force: boolean = false) {
    if (!this.enabled || !this.synth || !text) return;

    const now = Date.now();
    const isCooldownElapsed = now - this.lastSpokenTime >= this.cooldownMs;
    const isNewMessage = text !== this.lastSpokenText;

    if (!force && (!isCooldownElapsed || !isNewMessage)) {
      return;
    }

    try {
      // Cancel previous speech to prevent lagging audio cues
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.05; // Slightly athletic, energetic cadence
      utterance.pitch = 0.95;
      utterance.volume = this.volume;

      this.lastSpokenTime = now;
      this.lastSpokenText = text;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceCoach = new VoiceCoach();
