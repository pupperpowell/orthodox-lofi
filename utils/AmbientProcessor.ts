/**
 * Controls playback of ambient sounds like rain, crickets, and birds. Provides four methods
 * - setWindowClosed() = fully mutes nature audio, highly dampened rain
 * - setWindowOpen() = dampens nature audio, slightly dampened rain
 * - toggleOutside() = full volume of both, no filters
 * - toggleRain() = connects or disconnects rain from context graph
 */
export class AmbientProcessor {
  private audioContext: AudioContext;

  private raining: boolean = false;
  private outside: boolean = false;
  private windowOpen: boolean = false;

  // Master
  private masterGain: GainNode;
  private masterHighpassFilter: BiquadFilterNode;
  private masterLowpassFilter: BiquadFilterNode;

  // Rain
  private rainSource: MediaElementAudioSourceNode;
  private rainGain: GainNode;
  private rainHighpassFilter: BiquadFilterNode;
  private rainLowpassFilter: BiquadFilterNode;

  // Birds
  private doveSource: MediaElementAudioSourceNode;
  private doveGain: GainNode;
  private loonSource: MediaElementAudioSourceNode;
  private loonGain: GainNode;

  // Crickets
  private cricketsSource: MediaElementAudioSourceNode;
  private cricketsGain: GainNode;

  constructor(
    rain: HTMLAudioElement, 
    loons: HTMLAudioElement, 
    doves: HTMLAudioElement, 
    crickets: HTMLAudioElement
  ) {
    this.audioContext = new AudioContext();

    // Audio source nodes
    this.rainSource = this.audioContext.createMediaElementSource(rain);
    this.doveSource = this.audioContext.createMediaElementSource(doves);
    this.loonSource = this.audioContext.createMediaElementSource(loons);
    this.cricketsSource = this.audioContext.createMediaElementSource(crickets);

    this.masterLowpassFilter = this.audioContext.createBiquadFilter();
    this.masterLowpassFilter.type = "lowpass";
    this.masterHighpassFilter = this.audioContext.createBiquadFilter();
    this.masterHighpassFilter.type = "highpass";
    this.rainLowpassFilter = this.audioContext.createBiquadFilter();
    this.rainLowpassFilter.type = "lowpass";
    this.rainHighpassFilter = this.audioContext.createBiquadFilter();
    this.rainHighpassFilter.type = "highpass";

    this.masterGain = this.audioContext.createGain();
    this.rainGain = this.audioContext.createGain();
    this.doveGain = this.audioContext.createGain();
    this.loonGain = this.audioContext.createGain();
    this.cricketsGain = this.audioContext.createGain();

    this.connectChain();
    console.log("[AmbientProcessor] initialized");
  }

  connectChain() {
    this.rainSource
      .connect(this.rainHighpassFilter)
      .connect(this.rainLowpassFilter)
      .connect(this.rainGain)
      .connect(this.audioContext.destination);

    this.doveSource
      .connect(this.doveGain)
      .connect(this.audioContext.destination);

    this.loonSource
    .connect(this.loonGain)
    .connect(this.audioContext.destination);

    this.cricketsSource
    .connect(this.cricketsGain)
    .connect(this.audioContext.destination);

    // TODO: Implement rain/window/outside logic above
  }

  setRainEnabled(enabled: boolean) {
    this.raining = enabled;
    this.connectChain();
  }

  // 
  setWindowOpen(enabled: boolean) {
    this.windowOpen = enabled;
    this.connectChain();
  }

  setOutside(enabled: boolean) {
    this.outside = enabled;
    this.connectChain();
  }

  setLowPassFilterFrequency(frequency: number) {
    this.masterLowpassFilter.frequency.value = Math.max(
      20,
      Math.min(frequency, 20000),
    );
  }

  setHighPassFilterFrequency(frequency: number) {
    this.masterHighpassFilter.frequency.value = Math.max(
      20,
      Math.min(frequency, 20000),
    );
  }

  setVolume(volume: number) {
    this.masterGain.gain.value = volume;
  }
  
  play() {
    this.audioContext?.resume();
  }

  stop() {
    this.audioContext?.suspend();
  }

}
