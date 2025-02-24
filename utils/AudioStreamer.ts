export class AudioStreamer {
  private mediaSource: MediaSource;
  private audioElement: HTMLAudioElement;
  private streamUrl: string = "https://lofi.george.wiki/stream.ogg";

  constructor() {
    this.mediaSource = new MediaSource();
    this.audioElement = new Audio();
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

  public pauseStream(): void {
    this.audioElement.pause();
  }

  public getAudioElement(): HTMLAudioElement {
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
