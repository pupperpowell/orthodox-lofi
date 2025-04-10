export interface ProcessingChainOptions {
  highpassFrequency: number;
  lowpassFrequency: number;
  volume: number;
  rainEnabled: boolean;
  ambientEnabled: boolean;
  outside: boolean;
}

export class ProcessingChain {
  private context: AudioContext;
  private source: MediaElementAudioSourceNode | null = null;
  private isInitialized: boolean = false;

  // Base audio processing
  private highpass: BiquadFilterNode;
  private lowpass: BiquadFilterNode;
  private gainNode: GainNode;

  // Ambient audio processing
  // Rain elements
  private rainAudio: HTMLAudioElement;
  private rainSourceNode: AudioBufferSourceNode;
  private rainHighpass: BiquadFilterNode;
  private rainLowpass: BiquadFilterNode;
  private rainGainNode: GainNode;

  // Morning elements
  private morningAudio: HTMLAudioElement;
  private morningSourceNode: AudioBufferSourceNode;
  private morningHighpass: BiquadFilterNode;
  private morningLowpass: BiquadFilterNode;
  private morningGainNode: GainNode;

  constructor() {
    this.context = new globalThis.AudioContext();

    this.highpass = this.context.createBiquadFilter();
    this.lowpass = this.context.createBiquadFilter();
    this.gainNode = this.context.createGain();

    this.morningHighpass = this.context.createBiquadFilter();
    this.morningLowpass = this.context.createBiquadFilter();
    this.morningGainNode = this.context.createGain();

    // repeat for ambient processing chain as well
  }

  /**
   * Used to connect the raw audio obtained in AudioPlayer to the ProcessingChain.
   */
  public initialize(audio: HTMLAudioElement): void {
    if (this.isInitialized) {
      this.disconnect();
    }

    try {
      // Create source node from audio element
      this.source = this.context.createMediaElementSource(
        audio,
      );

      this.connectProcessingChain();

      console.log("[ProcessingChain] initialized");
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
    }
  }

  private connectProcessingChain() {
    if (!this.source) {
      console.error(
        "[ProcessingChain] No source found — can't connect processing chain",
      );
      return;
    } else {
      this.source.disconnect(); // why do we do this? is this required at all?

      // Create the processing chain for each audio source: base, rain, and ambient
      // source -> highpass -> lowpass -> gain -> destination

      this.highpass;
    }
  }

  /**
   * Resume the audio context (needed after user interaction in some browsers)
   */
  public resume(): Promise<void> {
    if (this.context && this.context.state === "suspended") {
      return this.context.resume();
    }
    return Promise.resolve();
  }

  public disconnect(): void {
    if (this.context) {
      this.context.close();
    }

    this.isInitialized = false;
    console.log("[ProcessingChain] Disconnected");
  }
}
