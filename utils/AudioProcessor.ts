import { AudioStreamer } from "./AudioStreamer.ts";

export class AudioProcessor {
  private context: AudioContext;
  private streamer: AudioStreamer;
  private streamSource: MediaElementAudioSourceNode | null = null;

  // GAIN, to control volume of each effect!
  private sourceGainNode: GainNode; // takes source input. controls source volume

  // FILTERS
  private highpassFilter: BiquadFilterNode; // allows frequencies greater than 'x' hz to "pass over"
  private lowpassFilter: BiquadFilterNode; // allows frequencies less than 'x' hertz to "pass under"

  constructor() {
    this.context = new AudioContext();
    this.streamer = new AudioStreamer();

    // Gain node setup
    this.sourceGainNode = this.context.createGain();

    // initial mix
    this.sourceGainNode.gain.value = 0.5;

    // Filter node(s) setup
    this.highpassFilter = this.context.createBiquadFilter();
    this.lowpassFilter = this.context.createBiquadFilter();

    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.value = 200; // starts at 200hz

    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 2250; // starts at 2250hz

    this.setupStreamSource();
  }

  private setupStreamSource() {
    // what does this do exactly...???
    const audioElement = this.streamer.getAudioElement();
    audioElement.load();
    this.streamSource = this.context.createMediaElementSource(audioElement);
    this.connectProcessingChain();
  }

  // Called when a new track is loaded
  // Literally chains each node to the next
  private connectProcessingChain() {
    if (!this.streamSource) {
      console.error(
        "Stream source is not set. Cannot connect processing chain.",
      );
      return;
    } else {
      this.streamSource.disconnect();
      let currentNode: AudioNode = this.streamSource; // audio source

      // connect filters...
      currentNode.connect(this.highpassFilter);
      currentNode = this.highpassFilter;
      currentNode.connect(this.lowpassFilter);
      currentNode = this.lowpassFilter;

      currentNode.connect(this.context.destination); // output
      console.log("Connected processing chain");
    }
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

  async play() {
    await this.context.resume();
    this.streamer.startStream();
  }

  async pause() {
    this.streamer.stopStream();
    await this.context.suspend();
  }

  setVolume(value: number) {
    this.streamer.setVolume(value);
  }
}
