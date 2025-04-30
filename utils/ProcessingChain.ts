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
  private chantSource: MediaElementAudioSourceNode | null = null;
  private isInitialized: boolean = false;

  // Base audio processing
  private chantHighpass: BiquadFilterNode | null = null;
  private chantLowpass: BiquadFilterNode | null = null;
  private chantGain: GainNode | null = null;

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
      this.chantHighpass = this.context.createBiquadFilter();
      this.chantHighpass.type = "highpass";

      this.chantLowpass = this.context.createBiquadFilter();
      this.chantLowpass.type = "lowpass";

      this.chantGain = this.context.createGain();

      // Create source node from audio element
      this.chantSource = this.context.createMediaElementSource(audio);
      this.connectProcessingChain();
      this.isInitialized = true;
      console.log("[ProcessingChain] initialized");
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
    }
  }

  private connectProcessingChain() {
    if (!this.chantSource || !this.chantHighpass || !this.chantLowpass || !this.chantGain || !this.context) {
      console.error(
        "[ProcessingChain] Audio nodes not available — can't connect processing chain"
      );
      return;
    }

    // Connect the nodes: source -> highpass -> lowpass -> gain -> destination
    this.chantSource.connect(this.chantHighpass);
    this.chantHighpass.connect(this.chantLowpass);
    this.chantLowpass.connect(this.chantGain);
    this.chantGain.connect(this.context.destination);

    // TODO: connect rain nodes (source, high/lowpass, gain) to destination


    // TODO: connect ambient nodes (source, high/lowpass, gain) to destination

  }

  /**
   * Update audio processing parameters
   */
  public updateOptions(options: ProcessingChainOptions): void {
    if (!this.isInitialized || !this.chantHighpass || !this.chantLowpass || !this.chantGain) {
      console.warn("[ProcessingChain] Not initialized, can't update options");
      return;
    }

    // Update filter and gain values
    this.chantHighpass.frequency.value = options.highpassFrequency;
    this.chantLowpass.frequency.value = options.lowpassFrequency;
    this.chantGain.gain.value = options.volume;

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
    if (this.chantSource) {
      this.chantSource.disconnect();
    }
    
    if (this.context) {
      this.context.close();
    }

    this.chantSource = null;
    this.chantGain = null;
    this.chantLowpass = null;
    this.chantGain = null;
    this.context = null;
    this.isInitialized = false;
    console.log("[ProcessingChain] Disconnected");
  }
}
