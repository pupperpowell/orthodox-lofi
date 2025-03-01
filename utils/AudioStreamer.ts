export class AudioStreamer {
  private audioElement: HTMLAudioElement;
  private streamUrl: string = "https://lofi.george.wiki/stream.mp3";

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.setAttribute("playsinline", "true"); // Add playsinline attribute for iOS
    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.src = this.streamUrl;
  }

  public async startStream(): Promise<void> {
    try {
      await this.audioElement.play();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(`Failed to start stream: ${error}`);
    }
  }

  // Stop the stream
  public stopStream(): void {
    this.audioElement.remove;
  }

  public getAudioElement(): HTMLAudioElement {
    console.log("Getting audio element");
    return this.audioElement;
  }

  public setVolume(value: number): void {
    this.audioElement.volume = Math.max(0, Math.min(1, value));
  }

  public isPlaying(): boolean {
    return !this.audioElement.paused;
  }

  public reconnect(): Promise<void> {
    this.audioElement.src = this.streamUrl;
    return this.startStream();
  }
}
