export interface ChantProcessorOptions {
  highpassFrequency: number;
  lowpassFrequency: number;
  volume: number;
  rainEnabled: boolean;
  ambientEnabled: boolean;
  outside: boolean;
}

export class ChantProcessor {
  private context: AudioContext | null = null;
  private chantSource: MediaElementAudioSourceNode | null = null;
  private isInitialized: boolean = false;

  // Base audio processing
  private chantHighpass: BiquadFilterNode | null = null;
  private chantLowpass: BiquadFilterNode | null = null;
  private chantGain: GainNode | null = null;

  private baseOptions: ChantProcessorOptions = { // Default base options
    highpassFrequency: 300,
    lowpassFrequency: 3000,
    volume: 0.5,
    rainEnabled: false,
    ambientEnabled: false,
    outside: false, // This 'outside' in baseOptions will be ignored by internal logic
  };
  private isCurrentlyOutside: boolean = false;

  constructor() {
    // Don't initialize AudioContext in the constructor
    // We'll do it lazily when initialize() is called
  }

  /**
   * Used to connect the raw audio obtained in AudioPlayer to the ChantProcessor.
   */
  public initialize(chant: HTMLAudioElement, initialBaseOptions: ChantProcessorOptions): void {
    if (this.isInitialized) {
      this.disconnect();
    }
    this.baseOptions = { ...this.baseOptions, ...initialBaseOptions };

    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.warn(
          "[ChantProcessor] Not in browser environment, skipping initialization",
        );
        return;
      }

      // Create AudioContext only when initialize is called
      this.context = new globalThis.AudioContext();

      // Create chant nodes
      this.chantSource = this.context.createMediaElementSource(chant);
      this.chantHighpass = this.context.createBiquadFilter();
      this.chantHighpass.type = "highpass";
      this.chantLowpass = this.context.createBiquadFilter();
      this.chantLowpass.type = "lowpass";
      this.chantGain = this.context.createGain();

      this.connectChantProcessor();
      this.isInitialized = true;
      this.applyCurrentSettings(); // Apply settings based on initial baseOptions and default isCurrentlyOutside
      console.log("[ChantProcessor] initialized");
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
    }
  }

  private connectChantProcessor() {
    if (
      !this.chantSource || !this.chantHighpass || !this.chantLowpass ||
      !this.chantGain || !this.context
    ) {
      console.error(
        "[ChantProcessor] Audio nodes not available — can't connect processing chain",
      );
      return;
    }

    // Connect the nodes: source -> highpass -> lowpass -> gain -> destination
    this.chantSource.connect(this.chantHighpass)
      .connect(this.chantLowpass)
      .connect(this.chantGain)
      .connect(this.context.destination);
  }

  private applyCurrentSettings(): void {
    if (!this.isInitialized || !this.chantHighpass || !this.chantLowpass || !this.chantGain) {
      // console.warn("[ChantProcessor] Not ready to apply settings.");
      return;
    }

    if (this.isCurrentlyOutside) {
      this.chantHighpass.frequency.value = 100; // Fixed "outside" Highpass
      this.chantLowpass.frequency.value = 1000; // Fixed "outside" Lowpass
      // Scale base volume (0-0.5) to outside volume (0-0.15)
      // Max master volume is 0.5, max outside volume is 0.15. Scaling factor = 0.15 / 0.5 = 0.3
      this.chantGain.gain.value = Math.max(0, Math.min(0.15, this.baseOptions.volume * 0.3));
    } else {
      this.chantHighpass.frequency.value = this.baseOptions.highpassFrequency;
      this.chantLowpass.frequency.value = this.baseOptions.lowpassFrequency;
      this.chantGain.gain.value = this.baseOptions.volume;
    }
    // console.log(
    //   `[ChantProcessor] Applied settings. Outside: ${this.isCurrentlyOutside}, Vol: ${this.chantGain.gain.value}, HP: ${this.chantHighpass.frequency.value}, LP: ${this.chantLowpass.frequency.value}`,
    // );
  }

  public toggleOutside(outside: boolean): void {
    if (!this.isInitialized) {
      console.warn("[ChantProcessor] Not initialized, can't toggle outside");
      return;
    }
    this.isCurrentlyOutside = outside;
    this.applyCurrentSettings();
    console.log("[ChantProcessor] Toggled outside:", this.isCurrentlyOutside);
  }

  /**
   * Update base audio processing parameters
   */
  public updateBaseOptions(newBaseOptions: Partial<ChantProcessorOptions>): void {
    if (!this.isInitialized) {
      console.warn("[ChantProcessor] Not initialized, can't update base options");
      return;
    }
    // Merge new partial options into existing baseOptions
    // Important: Do not let newBaseOptions.outside affect this.isCurrentlyOutside
    const { outside, ...restOfNewBaseOptions } = newBaseOptions;
    this.baseOptions = { ...this.baseOptions, ...restOfNewBaseOptions };
    this.applyCurrentSettings();
    // console.log("[ChantProcessor] Updated base options. Volume is now:", this.baseOptions.volume);
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
    console.log("[ChantProcessor] Disconnected");
  }
}
