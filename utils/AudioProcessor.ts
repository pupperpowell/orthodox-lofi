/**
 * AudioProcessor.ts
 *
 * A utility class to handle Web Audio API processing for the Orthodox Lofi player.
 * This separates audio processing logic from UI components.
 */

export interface AudioProcessorOptions {
  volume?: number;
  lowpassFrequency?: number;
  highpassFrequency?: number;
  reverbLevel?: number;
  // Add more effect parameters as needed
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private connectedAudio: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Default options
  private options: AudioProcessorOptions = {
    volume: 1.0,
    lowpassFrequency: 500, // Default to maximum (effectively disabled)
    highpassFrequency: 10000, // Default to minimum (effectively disabled)
  };

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
    console.log("connected lofi filters");
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Apply current settings to all nodes
   */
  private applySettings(): void {
    this.setVolume(this.options.volume || 1.0);
    this.setLowpassFrequency(this.options.lowpassFrequency || 20000);
    this.setHighpassFrequency(this.options.highpassFrequency || 20);
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

    this.audioContext = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.lowpassFilter = null;
    this.highpassFilter = null;
    this.connectedAudio = null;
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
export const audioProcessor = new AudioProcessor();
