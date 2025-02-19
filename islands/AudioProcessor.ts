export class AudioProcessor {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

  private highpassFilter: BiquadFilterNode;
  private lowpassFilter: BiquadFilterNode;

  private distortion: WaveShaperNode;
  private saturation: WaveShaperNode;

  private filtersEnabled: boolean = true;
  private distortionEnabled: boolean = true;
  private saturationEnabled: boolean = true;

  constructor() {
    this.context = new AudioContext();

    // Initial filter setup
    this.highpassFilter = this.context.createBiquadFilter();
    this.lowpassFilter = this.context.createBiquadFilter();

    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.value = 200;

    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 5000;

    // Distortion and saturation setup
    this.distortion = this.context.createWaveShaper();
    this.saturation = this.context.createWaveShaper();
  }

  // Hard clipping for distortion
  private createDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(amount * x); // Hard clipping
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

    // Connect the audio chain
    this.source
      .connect(this.highpassFilter)
      .connect(this.lowpassFilter)
      .connect(this.context.destination);
  }

  toggleFilters() {
    // Toggle filters on/off
    this.filtersEnabled = !this.filtersEnabled;

    if (this.source) {
      this.source.disconnect();

      if (this.filtersEnabled) {
        this.source
          .connect(this.highpassFilter)
          .connect(this.lowpassFilter)
          .connect(this.context.destination);
      } else {
        this.source.connect(this.context.destination);
      }
    }
  }

  toggleDistortion() {
    this.distortionEnabled = !this.distortionEnabled;

    if (this.source) {
      this.source.disconnect();
      if (this.distortionEnabled) {
        this.source
          .connect(this.distortion)
          .connect(this.context.destination);
      } else {
        this.source.connect(this.context.destination);
      }
    }
  }

  toggleSaturation() {
    this.saturationEnabled = !this.saturationEnabled;

    if (this.source) {
      this.source.disconnect();
      if (this.saturationEnabled) {
        this.source
          .connect(this.saturation)
          .connect(this.context.destination);
      } else {
        this.source.connect(this.context.destination);
      }
    }
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
