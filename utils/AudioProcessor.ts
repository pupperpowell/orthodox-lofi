export class AudioProcessor {
  private audioContext: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private lowPassFilter: BiquadFilterNode;
  private highPassFilter: BiquadFilterNode;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new AudioContext();

    // Low-pass filter to muffle high frequencies
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = "lowpass";
    this.lowPassFilter.frequency.value = 1500; // Cutoff around 1.5kHz

    this.lowPassFilter.Q.value = 1;

    // High-pass filter to muffle low frequencies
    this.highPassFilter = this.audioContext.createBiquadFilter();
    this.highPassFilter.type = "highpass";
    this.highPassFilter.frequency.value = 500; // Cutoff around 500Hz

    this.highPassFilter.Q.value = 1;

    // Gain control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.8; // Slight volume reduction (AI)
  }
}
