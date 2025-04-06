export class RainProcessor {
  private audioContext: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private lowPassFilter: BiquadFilterNode;
  private gainNode: GainNode;

  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor() {
    this.audioContext = new AudioContext();

    // Low-pass filter to muffle high frequencies
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = "lowpass";
    this.lowPassFilter.frequency.value = 1500; // Cutoff around 1.5kHz

    // Gain control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.8; // Slight volume reduction

    this.wetGain = this.audioContext.createGain();
    this.dryGain = this.audioContext.createGain();
    this.wetGain.gain.value = 0.5; // Wet gain
    this.dryGain.gain.value = 0.5; // Dry gain
  }

  async loadAudioFile(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;

    // Chain nodes: Source -> Low-pass filter -> Reverb -> Gain -> Output
    this.source.connect(this.lowPassFilter)
      //   .connect(this.reverb)
      .connect(this.gainNode)
      .connect(this.audioContext.destination);
  }

  setLowPassFilterFrequency(frequency: number) {
    this.lowPassFilter.frequency.value = Math.max(
      20,
      Math.min(frequency, 20000),
    );
  }

  setLowPassQ(q: number) {
    this.lowPassFilter.Q.value = Math.max(0.0001, Math.min(q, 1000));
  }

  setReverbMix(wetAmt: number) {
    const wet = Math.max(0, Math.min(wetAmt, 1));
    const dry = 1 - wet;

    this.wetGain.gain.value = wet;
    this.dryGain.gain.value = dry;
  }

  play() {
    if (!this.source) return;
    this.source.start();
  }

  stop() {
    if (!this.source) return;
    this.source.stop();
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume;
  }
}
