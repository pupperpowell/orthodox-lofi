import { AudioStreamer } from "./AudioStreamer.ts";

// deno-lint-ignore no-unused-vars
class AudioProcessor {
  private context: AudioContext;
  private streamer: AudioStreamer;
  private streamSource: MediaElementAudioSourceNode | null = null;

  private sourceGainNode: GainNode;

  // FILTERS
  private highpassFilter: BiquadFilterNode; // allows frequencies greater than 'x' hz to "pass over"
  private lowpassFilter: BiquadFilterNode; // allows frequencies less than 'x' hertz to "pass under"

  constructor() {
    this.context = new AudioContext();
    this.streamer = new AudioStreamer();

    // Gain node setup
    this.sourceGainNode = this.context.createGain();

    // initial volume
    this.sourceGainNode.gain.value = 0.25;

    // Filter node(s) setup
    this.highpassFilter = this.context.createBiquadFilter();
    this.lowpassFilter = this.context.createBiquadFilter();

    // original filters: 200, 2250
    // alanna suggested: 100, 10000
    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.value = 100; // starts at 100hz

    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 5250; // starts at 5250hz

    this.setupStreamSource();
  }

  /**
   * Sets up the stream source for the audio processing chain.
   * Loads the audio element, creates a media element source node from it,
   * and then connects the processing chain to the source.
   */
  private setupStreamSource() {
    const audioElement = this.streamer.getAudioElement();
    audioElement.load();
    this.streamSource = this.context.createMediaElementSource(audioElement);
    this.connectProcessingChain();
  }

  private connectProcessingChain() {
    if (!this.streamSource) {
      console.error(
        "Stream source is not set. Cannot connect processing chain.",
      );
      return;
    } else {
      this.streamSource.disconnect();

      this.streamSource.connect(this.highpassFilter)
        .connect(this.lowpassFilter)
        .connect(this.sourceGainNode)
        .connect(this.context.destination);
      console.log("Connected processing chain");
    }
  }

  setHighpassFrequency(freq: number) {
    this.highpassFilter.frequency.value = freq;
  }

  setLowpassFrequency(freq: number) {
    this.lowpassFilter.frequency.value = freq;
  }

  async play() {
    await this.context.resume();
  }

  async pause() {
    await this.context.suspend();
  }

  setVolume(value: number) {
    this.sourceGainNode.gain.value = value;
  }
}
