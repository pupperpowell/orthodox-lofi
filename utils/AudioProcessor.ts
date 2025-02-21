export class AudioProcessor {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

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
    this.context = new AudioContext();

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
    if (!this.source) return;

    this.source.disconnect();
    let currentNode: AudioNode = this.source; // audio source

    // connect filters...
    currentNode.connect(this.highpassFilter);
    currentNode = this.highpassFilter;
    currentNode.connect(this.lowpassFilter);
    currentNode = this.lowpassFilter;

    currentNode.connect(this.context.destination); // output
  }

  async loadTrack(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    this.source = this.context.createBufferSource();
    this.source.buffer = audioBuffer;

    this.connectProcessingChain();
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

  play() {
    this.source?.start();
  }

  stop() {
    this.source?.stop();
  }

  pause() {
    this.context.suspend();
  }

  resume() {
    this.context.resume();
  }
}
