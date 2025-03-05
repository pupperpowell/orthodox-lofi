export class AudioStreamer {
  private audioElement: HTMLAudioElement;
  private lofiAudioElement: HTMLAudioElement;
  private streamUrl: string = "https://lofi.george.wiki/stream.mp3";
  private lofiUrl: string = "https://lofi.george.wiki/lofi.mp3";

  public lofiActive: boolean = true;

  constructor() {
    this.audioElement = new Audio();
    this.lofiAudioElement = new Audio();
    this.audioElement.setAttribute("playsinline", "true");
    this.lofiAudioElement.setAttribute("playsinline", "true");
    this.audioElement.crossOrigin = "anonymous";
    this.lofiAudioElement.crossOrigin = "anonymous";

    this.audioElement.src = this.streamUrl;
    this.lofiAudioElement.src = this.lofiUrl;
  }

  public async startStream(): Promise<void> {
    try {
      const activeElement = this.lofiActive
        ? this.lofiAudioElement
        : this.audioElement;
      await activeElement.play();
      console.log(`${this.lofiActive ? "Lofi" : "Regular"} stream started`);
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

    const wasPlaying = this.lofiActive
      ? !this.lofiAudioElement.paused
      : !this.audioElement.paused;

    // Pause current stream
    this.pauseStream();

    // Switch active stream
    this.lofiActive = lofi;

    // If something was playing, start the new stream
    if (wasPlaying) {
      this.startStream();
    }
  }

  public setVolume(value: number): void {
    const normalizedValue = Math.max(0, Math.min(1, value));
    const activeElement = this.lofiActive
      ? this.lofiAudioElement
      : this.audioElement;
    activeElement.volume = normalizedValue;
  }

  public isPlaying(): boolean {
    return this.lofiActive
      ? !this.lofiAudioElement.paused
      : !this.audioElement.paused;
  }

  public reconnect(): Promise<void> {
    this.audioElement.src = this.streamUrl;
    this.lofiAudioElement.src = this.lofiUrl;
    return this.startStream();
  }
}
