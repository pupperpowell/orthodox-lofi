export interface ProcessingChainOptions {
  highpassFrequency: number;
  lowpassFrequency: number;
  volume: number;
  rainEnabled: boolean;
  ambientEnabled: boolean;
  outside: boolean;
}

export class ProcessingChain {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private isInitialized: boolean = false;

  // Base audio processing
  private highpass: BiquadFilterNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Don't initialize AudioContext in the constructor
    // We'll do it lazily when initialize() is called
  }

  /**
   * Used to connect the raw audio obtained in AudioPlayer to the ProcessingChain.
   */
  public initialize(audio: HTMLAudioElement): void {
    if (this.isInitialized) {
      this.disconnect();
    }

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn("[ProcessingChain] Not in browser environment, skipping initialization");
        return;
      }

      // Create AudioContext only when initialize is called
      this.context = new globalThis.AudioContext();
      
      // Create audio nodes
      this.highpass = this.context.createBiquadFilter();
      this.highpass.type = "highpass";

      this.lowpass = this.context.createBiquadFilter();
      this.lowpass.type = "lowpass";

      this.gainNode = this.context.createGain();

      // Create source node from audio element
      this.source = this.context.createMediaElementSource(audio);
      this.connectProcessingChain();
      this.isInitialized = true;
      console.log("[ProcessingChain] initialized");
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
    }
  }

  private connectProcessingChain() {
    if (!this.source || !this.highpass || !this.lowpass || !this.gainNode || !this.context) {
      console.error(
        "[ProcessingChain] Audio nodes not available — can't connect processing chain"
      );
      return;
    }

    // Connect the nodes: source -> highpass -> lowpass -> gain -> destination
    this.source.connect(this.highpass);
    this.highpass.connect(this.lowpass);
    this.lowpass.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    // TODO: connect rain nodes (source, high/lowpass, gain) to destination


    // TODO: connect ambient nodes (source, high/lowpass, gain) to destination

  }

  /**
   * Update audio processing parameters
   */
  public updateOptions(options: ProcessingChainOptions): void {
    if (!this.isInitialized || !this.highpass || !this.lowpass || !this.gainNode) {
      console.warn("[ProcessingChain] Not initialized, can't update options");
      return;
    }

    // Update filter and gain values
    this.highpass.frequency.value = options.highpassFrequency;
    this.lowpass.frequency.value = options.lowpassFrequency;
    this.gainNode.gain.value = options.volume;

    // Here you would also handle the ambient and rain audio based on options
    console.log("[ProcessingChain] Options updated:", options);
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

  /**
   * Check if the processing chain is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  public disconnect(): void {
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.context) {
      this.context.close();
    }

    this.source = null;
    this.highpass = null;
    this.lowpass = null;
    this.gainNode = null;
    this.context = null;
    this.isInitialized = false;
    console.log("[ProcessingChain] Disconnected");
  }
}
