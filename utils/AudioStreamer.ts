export class AudioStreamer {
  private audioElement: HTMLAudioElement;
  private lofiAudioElement: HTMLAudioElement;
  private streamUrl: string = "https://lofi.george.wiki/stream.mp3";
  private lofiUrl: string = "https://lofi.george.wiki/lofi.mp3";

  public lofiActive: boolean = true;

  constructor() {
    // Create the base stream audio element
    this.audioElement = new Audio();
    this.audioElement.setAttribute("playsinline", "true");
    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.src = this.streamUrl;

    // Create the lofi stream audio element
    this.lofiAudioElement = new Audio();
    this.lofiAudioElement.setAttribute("playsinline", "true");
    this.lofiAudioElement.crossOrigin = "anonymous";
    this.lofiAudioElement.src = this.lofiUrl;
  }

  public async startStream(): Promise<void> {
    try {
      // Set initial mute states based on which stream should be active
      this.audioElement.muted = this.lofiActive;
      this.lofiAudioElement.muted = !this.lofiActive;

      // Start both streams
      const promises = [
        this.audioElement.play(),
        this.lofiAudioElement.play(),
      ];

      await Promise.all(promises);
      console.log(
        `Both streams started. Active: ${this.lofiActive ? "Lofi" : "Regular"}`,
      );
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(`Failed to start stream: ${error}`);
    }
  }

  public pauseStream(): void {
    this.audioElement.pause();
    this.lofiAudioElement.pause();
  }

  public setLofi(lofi: boolean): void {
    if (lofi === this.lofiActive) return;

    // Update which stream is muted
    this.audioElement.muted = lofi;
    this.lofiAudioElement.muted = !lofi;

    // Switch active stream flag
    this.lofiActive = lofi;

    console.log(`Switched to ${lofi ? "Lofi" : "Regular"} stream`);
  }

  public setVolume(value: number): void {
    const normalizedValue = Math.max(0, Math.min(1, value));
    // Apply volume to both elements since we don't know which are playing
    this.audioElement.volume = normalizedValue;
    this.lofiAudioElement.volume = normalizedValue;
  }

  public isPlaying(): boolean {
    // Since both streams play together, we can check either one
    // But for safety, we'll consider it playing if either is playing
    return !this.audioElement.paused || !this.lofiAudioElement.paused;
  }

  public stopStream(): void {
    // Discards both audio elements?
    this.audioElement.src = "";
    this.lofiAudioElement.src = "";
  }
}
