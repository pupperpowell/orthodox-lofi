import { AudioStreamer } from "./AudioStreamer.ts";

export class AudioProcessor {
  private context: AudioContext;
  private streamer: AudioStreamer;
  private streamSource: MediaElementAudioSourceNode | null = null;

  // GAIN, to control volume of each effect!
  private sourceGainNode: GainNode; // takes source input. controls source volume
  private filtersGainNode: GainNode; // takes source, highpass, lowpass, and controls overall volume?!
  private distortionGainNode: GainNode; // how do i split this up?

  // FILTERS
  private highpassFilter: BiquadFilterNode; // allows frequencies greater than 'x' hz to "pass over"
  private lowpassFilter: BiquadFilterNode; // allows frequencies less than 'x' hertz to "pass under"

  // DISTORTION
  private distortion: WaveShaperNode;
  private saturation: WaveShaperNode; // basically the same thing as distortion. fix later

  constructor() {
    // Mobile browsers require context creation during user interaction
    this.context = new AudioContext();
    this.streamer = new AudioStreamer();

    // Gain node setup
    this.sourceGainNode = this.context.createGain();
    this.filtersGainNode = this.context.createGain();
    this.distortionGainNode = this.context.createGain();

    // initial mix
    this.sourceGainNode.gain.value = 0.5;
    this.filtersGainNode.gain.value = 0.5;
    this.distortionGainNode.gain.value = 0.5;

    // Filter node(s) setup
    this.highpassFilter = this.context.createBiquadFilter();
    this.lowpassFilter = this.context.createBiquadFilter();

    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.value = 200; // starts at 200hz

    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 2250; // starts at 2250hz

    // Distortion and saturation nodes setup
    this.distortion = this.context.createWaveShaper();
    this.saturation = this.context.createWaveShaper();

    this.setupStreamSource();
  }

  private setupStreamSource() {
    const audioElement = this.streamer.getAudioElement();
    this.streamSource = this.context.createMediaElementSource(audioElement);
    this.connectProcessingChain();
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
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      // Asymmetric soft clipping to emulate tube characteristics
      curve[i] = x >= 0 ? Math.tanh(amount * x) : Math.tanh(amount * x * 0.8); // Less compression on negative values
    }
    return curve;
  }

  // Called when a new track is loaded
  // Literally chains each node to the next
  private connectProcessingChain() {
    if (!this.streamSource) return;

    this.streamSource.disconnect();
    let currentNode: AudioNode = this.streamSource; // audio source

    // connect filters...
    currentNode.connect(this.highpassFilter);
    currentNode = this.highpassFilter;
    currentNode.connect(this.lowpassFilter);
    currentNode = this.lowpassFilter;

    currentNode.connect(this.context.destination); // output
    console.log("Connected processing chain, including filters");
  }

  toggleFilters() {
    // set filter gains to 0
  }

  toggleDistortion() {
    // set the distortion amount to 0. This will disable the distortion effect
  }

  toggleSaturation() {
    // set the saturation amount to 1. This will disable the saturation effect
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

  async play() {
    await this.context.resume();
    await this.streamer.startStream();
  }

  async pause() {
    this.streamer.pauseStream();
    await this.context.suspend();
  }

  setVolume(value: number) {
    this.streamer.setVolume(value);
  }

  public async resume(): Promise<void> {
    if (this.context.state === "closed") {
      this.context = new AudioContext();
      this.setupStreamSource();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    // Required for iOS Safari
    if (this.streamSource === null) {
      this.setupStreamSource();
    }

    console.log("Resumed audio context");
  }
}
