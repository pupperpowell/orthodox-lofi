export class AudioStreamer {
  private audioElement: HTMLAudioElement;
  private lofiAudioElement: HTMLAudioElement;
  private streamUrl: string = "https://lofi.george.wiki/stream.mp3";
  private lofiUrl: string = "https://lofi.george.wiki/lofi.mp3";

  public lofiActive: boolean = true;

  constructor() {
    this.audioElement = new Audio();
    this.lofiAudioElement = new Audio();
    this.audioElement.setAttribute("playsinline", "true"); // For iOS?
    this.lofiAudioElement.setAttribute("playsinline", "true");
    this.audioElement.crossOrigin = "anonymous";
    this.lofiAudioElement.crossOrigin = "anonymous";

    // initialize the audio elements
    this.audioElement.src = this.streamUrl;
    this.lofiAudioElement.src = this.lofiUrl;
    // but mute the regular audio element
    this.audioElement.muted = true;
  }

  public async startStream(): Promise<void> {
    try {
      await this.audioElement.play();
      console.log("Stream started");
      await this.lofiAudioElement.play();
      console.log("Lofi stream started");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(`Failed to start stream: ${error}`);
    }
  }

  // Stop the stream
  public pauseStream(): void {
    this.audioElement.pause();
    this.lofiAudioElement.pause();
  }

  public getAudioElement(): HTMLAudioElement {
    console.log("Getting audio element");
    return this.audioElement;
  }

  public setLofi(lofi: boolean): void {
    // Get the current volume
    const currentVolume = this.lofiActive
      ? this.lofiAudioElement.volume
      : this.audioElement.volume;

    if (lofi) {
      // Lofi mode ON
      this.audioElement.muted = true;
      this.lofiAudioElement.muted = false;
      this.lofiAudioElement.volume = currentVolume;
    } else {
      // Lofi mode OFF
      this.audioElement.muted = false;
      this.lofiAudioElement.muted = true;
      this.audioElement.volume = currentVolume;
    }

    this.lofiActive = lofi;
    console.log("[AudioStreamer] Lofi active:", this.lofiActive);
  }

  public setVolume(value: number): void {
    const normalizedValue = Math.max(0, Math.min(1, value));
    // Set volume for both elements, only active one will be heard
    this.audioElement.volume = normalizedValue;
    this.lofiAudioElement.volume = normalizedValue;
  }

  public isPlaying(): boolean {
    return !this.audioElement.paused;
  }

  public reconnect(): Promise<void> {
    this.audioElement.src = this.streamUrl;
    this.lofiAudioElement.src = this.lofiUrl;
    return this.startStream();
  }
}
