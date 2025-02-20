export class AudioProcessor {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

  private gainNode: GainNode;

  private highpassFilter: BiquadFilterNode;
  private lowpassFilter: BiquadFilterNode;

  private distortion: WaveShaperNode;
  private saturation: WaveShaperNode;

  private filtersEnabled: boolean = true;
  private distortionEnabled: boolean = true;
  private saturationEnabled: boolean = true;

  constructor() {
    this.context = new AudioContext();

    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = 0.5;

    // Initial filter setup
    this.highpassFilter = this.context.createBiquadFilter();
    this.lowpassFilter = this.context.createBiquadFilter();

    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.value = 20;

    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 2250;

    // Distortion and saturation setup
    this.distortion = this.context.createWaveShaper();
    this.saturation = this.context.createWaveShaper();
  }

  // Hard clipping for distortion
  private createDistortionCurve(amount = 20) {
    const n_samples = 256;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = i * 2 / n_samples - 1;
      curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // Tube-style saturation curve
  private createSaturationCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      // Asymmetric soft clipping to emulate tube characteristics
      curve[i] = x >= 0 ? Math.tanh(amount * x) : Math.tanh(amount * x * 0.8); // Less compression on negative values
    }
    return curve;
  }

  async loadTrack(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    this.source = this.context.createBufferSource();
    this.source.buffer = audioBuffer;

    this.connectProcessingChain();
  }

  private connectProcessingChain() {
    if (!this.source) return;

    this.source.disconnect();
    let currentNode: AudioNode = this.source;

    if (this.filtersEnabled) {
      currentNode.connect(this.highpassFilter);
      currentNode = this.highpassFilter;
      currentNode.connect(this.lowpassFilter);
      currentNode = this.lowpassFilter;
    }

    if (this.distortionEnabled) {
      currentNode.connect(this.distortion);
      currentNode = this.distortion;
    }

    if (this.saturationEnabled) {
      currentNode.connect(this.saturation);
      currentNode = this.saturation;
    }

    currentNode.connect(this.context.destination);
  }

  toggleFilters() {
    this.filtersEnabled = !this.filtersEnabled;
    this.connectProcessingChain();
    console.log("Filters set to ", this.filtersEnabled);
  }

  toggleDistortion() {
    this.distortionEnabled = !this.distortionEnabled;
    this.distortion.curve = this.createDistortionCurve(0.5);
    this.connectProcessingChain();
    console.log("Distortion set to ", this.filtersEnabled);
  }

  toggleSaturation() {
    this.saturationEnabled = !this.saturationEnabled;
    this.saturation.curve = this.createSaturationCurve(0.5);
    this.connectProcessingChain();
    console.log("Saturation set to ", this.filtersEnabled);
  }

  setHighpassFrequency(freq: number) {
    this.highpassFilter.frequency.value = freq;
  }

  setLowpassFrequency(freq: number) {
    this.lowpassFilter.frequency.value = freq;
  }

  setDistortion(amount: number) {
    this.distortion.curve = this.createDistortionCurve(amount);
  }

  setSaturation(amount: number) {
    this.saturation.curve = this.createSaturationCurve(amount);
  }

  play() {
    this.source?.start();
  }

  stop() {
    this.source?.stop();
  }
}
