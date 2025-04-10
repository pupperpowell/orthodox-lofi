/**
 * AudioProcessor.ts
 *
 * A utility class to handle Web Audio API processing for the Orthodox Lofi player.
 * This separates audio processing logic from UI components.
 */

export interface AudioProcessorOptions {
  volume?: number;
  lowpassFrequency: number;
  highpassFrequency: number;
  rainEnabled: boolean;
  rainVolume: number;

  // Add more effect parameters as needed
}

export class AudioProcessor {
  // Audio elements
  private audioContext: AudioContext;
  private sourceNode: MediaElementAudioSourceNode;
  private gainNode: GainNode;
  private lowpassFilter: BiquadFilterNode;
  private highpassFilter: BiquadFilterNode;
  private connectedAudio: HTMLAudioElement;
  private isInitialized = false;

  // Rain elements
  private rainAudio: HTMLAudioElement;
  private rainSourceNode: AudioBufferSourceNode;
  private rainGainNode: GainNode;

  // Default options
  private options: AudioProcessorOptions = {
    volume: 1.0,
    lowpassFrequency: 2250, // Default to maximum (effectively disabled)
    highpassFrequency: 200, // Default to minimum (effectively disabled)
    rainEnabled: false,
    rainVolume: 0.5,
  };

  private constructor(
    audioElement: HTMLAudioElement,
    options?: AudioProcessorOptions,
  ) {
    // Initialize base elements
    this.audioContext = new globalThis.AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.gainNode = this.audioContext.createGain();
    this.lowpassFilter = this.audioContext.createBiquadFilter();
    this.highpassFilter = this.audioContext.createBiquadFilter();
    // Initialize rain elements
    this.rainAudio = new Audio("/static/audio/rain.wav");
    this.rainAudio.loop = true;
    this.rainSourceNode = this.audioContext.createMediaElementSource(
      this.rainAudio,
    );
    this.rainGainNode = this.audioContext.createGain();
  }

  public static create(
    audioElement: HTMLAudioElement,
    options?: AudioProcessorOptions,
  ): AudioProcessor {
    return new AudioProcessor(audioElement, options);
  }

  /**
   * Initialize the audio processing chain with an audio element
   */
  public initialize(
    audioElement: HTMLAudioElement,
    options?: AudioProcessorOptions,
  ): void {
    if (this.isInitialized) {
      this.disconnect();
    }

    // Merge provided options with defaults
    if (options) {
      this.options = { ...this.options, ...options };
    }

    try {
      // Create audio context
      this.audioContext = new globalThis.AudioContext();

      // Create source node from audio element
      this.sourceNode = this.audioContext.createMediaElementSource(
        audioElement,
      );
      this.connectedAudio = audioElement;

      // Create processing nodes
      this.createProcessingNodes();

      // Initialize rain audio
      this.initializeRainAudio();

      // Connect the nodes
      this.connectNodes();

      this.isInitialized = true;

      // Apply initial settings
      this.applySettings();

      console.log("Audio processor initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio processor:", error);
    }
  }

  /**
   * Create all the audio processing nodes
   */
  private createProcessingNodes(): void {
    if (!this.audioContext) return;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();

    // Create filter nodes
    this.lowpassFilter = this.audioContext.createBiquadFilter();
    this.lowpassFilter.type = "lowpass";

    this.highpassFilter = this.audioContext.createBiquadFilter();
    this.highpassFilter.type = "highpass";

    // Add more effect nodes as needed
  }

  /**
   * Initialize rain audio element and nodes
   */
  private initializeRainAudio(): void {
    if (!this.audioContext) return;

    // Create rain audio element
    this.rainAudio = new Audio("/static/audio/rain.wav");
    this.rainAudio.loop = true;

    // Create rain source node
    this.rainSourceNode = this.audioContext.createMediaElementSource(
      this.rainAudio,
    );

    // Create rain gain node for volume control
    this.rainGainNode = this.audioContext.createGain();
    this.rainGainNode.gain.value = this.options.rainVolume || 0.5;

    // Connect rain nodes
    this.rainSourceNode.connect(this.rainGainNode);
    this.rainGainNode.connect(this.audioContext.destination);

    // Set initial state based on options
    if (this.options.rainEnabled) {
      this.enableRain();
    }
  }

  /**
   * Connect the audio processing nodes in a chain
   */
  private connectNodes(): void {
    if (
      !this.audioContext || !this.sourceNode || !this.gainNode ||
      !this.lowpassFilter || !this.highpassFilter
    ) return;

    // Create the processing chain:
    // source -> highpass -> lowpass -> gain -> destination
    this.sourceNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Apply current settings to all nodes
   */
  private applySettings(): void {
    this.setVolume(this.options.volume || 1.0);
    this.setLowpassFrequency(this.options.lowpassFrequency);
    this.setHighpassFrequency(this.options.highpassFrequency);
    // Apply other effect settings
  }

  /**
   * Update processor settings
   */
  public updateSettings(options: AudioProcessorOptions): void {
    this.options = { ...this.options, ...options };
    this.applySettings();
  }

  /**
   * Set the volume level
   */
  public setVolume(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(2, value)); // Clamp between 0 and 2
      this.options.volume = value;
    }
  }

  /**
   * Toggle rain sound on/off
   */
  public toggleRain(): void {
    this.options.rainEnabled = !this.options.rainEnabled;
  }

  /**
   * Set the lowpass filter frequency
   */
  public setLowpassFrequency(value: number): void {
    if (this.lowpassFilter) {
      this.lowpassFilter.frequency.value = value;
      this.options.lowpassFrequency = value;
    }
  }

  /**
   * Set the highpass filter frequency
   */
  public setHighpassFrequency(value: number): void {
    if (this.highpassFilter) {
      this.highpassFilter.frequency.value = value;
      this.options.highpassFrequency = value;
    }
  }

  /**
   * Resume the audio context (needed after user interaction in some browsers)
   */
  public resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      return this.audioContext.resume();
    }
    return Promise.resolve();
  }

  /**
   * Disconnect and clean up all audio nodes
   */
  public disconnect(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
    }

    if (this.lowpassFilter) {
      this.lowpassFilter.disconnect();
    }

    if (this.highpassFilter) {
      this.highpassFilter.disconnect();
    }

    // Disconnect any other nodes you've created

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.isInitialized = false;
  }

  /**
   * Check if the processor is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Create and export a singleton instance
export const audioProcessor = AudioProcessor.create(audioElement, options);
