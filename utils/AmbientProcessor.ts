/**
 * Controls playback of ambient sounds like rain, crickets, and birds. Provides four methods
 * - setWindowClosed() = fully mutes nature audio, highly dampened rain
 * - setWindowOpen() = dampens nature audio, slightly dampened rain
 * - toggleOutside() = full volume of both, no filters
 * - toggleRain() = connects or disconnects rain from context graph
 */

type Location = "outside" | "inside";

export class AmbientProcessor {
  private audioContext: AudioContext;

  private rainAudio: HTMLAudioElement;
  private dovesAudio: HTMLAudioElement;
  private loonsAudio: HTMLAudioElement;
  private cricketsAudio: HTMLAudioElement;

  private location: Location;
  private windowOpen: boolean = false;
  private raining: boolean = false;

  // Master
  private masterGain: GainNode;
  private cricketsHighpassFilter: BiquadFilterNode;
  private cricketsLowpassFilter: BiquadFilterNode;
  private pan: StereoPannerNode;

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

  private lowpassDisabled: number = 50000;
  private highpassDisabled: number = 0;

  // Values for each location
  private filters: { [key: string]: number } = {
    insideRainHighpass: 300,
    insideRainLowpass: 2500,
    insideRainGain: 0.3,
    // 
    windowOpenRainHighpass: 200,
    windowOpenRainLowpass: 5000,
    windowOpenRainGain: 0.2,
    windowOpenCricketsHighpass: 100,
    windowOpenCricketsLowpass: 2000,
    windowOpenCricketsGain: 0.3,
    windowOpenPan: 0.4, // to the right
    //
    outsideRainHighpass: this.highpassDisabled,
    outsideRainLowpass: this.lowpassDisabled,
    outsideRainGain: 0.6,
    outsideCricketsHighpass: this.highpassDisabled,
    outsideCricketsLowpass: this.lowpassDisabled,
    outsideCricketsGain: 0.3,
    outsideDovesGain: 0.7,
    outsideLoonsGain: 0.3,
  }


  constructor(
    rain: HTMLAudioElement, 
    loons: HTMLAudioElement, 
    doves: HTMLAudioElement, 
    crickets: HTMLAudioElement
  ) {
    this.audioContext = new AudioContext();

    this.location = "inside";

    this.rainAudio = rain;
    this.dovesAudio = doves;
    this.loonsAudio = loons;
    this.cricketsAudio = crickets;

    // Audio source nodes
    this.rainSource = this.audioContext.createMediaElementSource(rain);
    this.doveSource = this.audioContext.createMediaElementSource(doves);
    this.loonSource = this.audioContext.createMediaElementSource(loons);
    this.cricketsSource = this.audioContext.createMediaElementSource(crickets);

    this.cricketsLowpassFilter = this.audioContext.createBiquadFilter();
    this.cricketsLowpassFilter.type = "lowpass";
    this.cricketsHighpassFilter = this.audioContext.createBiquadFilter();
    this.cricketsHighpassFilter.type = "highpass";
    
    this.rainLowpassFilter = this.audioContext.createBiquadFilter();
    this.rainLowpassFilter.type = "lowpass";
    this.rainHighpassFilter = this.audioContext.createBiquadFilter();
    this.rainHighpassFilter.type = "highpass";

    this.pan = this.audioContext.createStereoPanner();

    this.masterGain = this.audioContext.createGain();
    this.rainGain = this.audioContext.createGain();
    this.doveGain = this.audioContext.createGain();
    this.loonGain = this.audioContext.createGain();
    this.cricketsGain = this.audioContext.createGain();

    this.adjustFilters();

    this.connectChain();
    console.log("[AmbientProcessor] initialized");
  }

  connectChain() {

    this.rainSource
      // apparently the filters have default settings!
      .connect(this.rainGain)
      .connect(this.rainHighpassFilter)
      .connect(this.rainLowpassFilter)
      .connect(this.pan)
      .connect(this.masterGain)
      .connect(this.audioContext.destination);

    this.doveSource
      .connect(this.doveGain)

      .connect(this.masterGain)
      .connect(this.audioContext.destination);

    this.loonSource
      .connect(this.loonGain)

      .connect(this.masterGain)
      .connect(this.audioContext.destination);
      
    this.cricketsSource
      .connect(this.cricketsGain)
      .connect(this.cricketsHighpassFilter)
      .connect(this.cricketsLowpassFilter)
      .connect(this.pan)
      .connect(this.masterGain)
      .connect(this.audioContext.destination);
    
    console.log("[AmbientProcessor] connected chain");
  }

  adjustFilters() {
    // INSIDE, WINDOW OPEN
    if (this.location == "inside" && this.windowOpen) {
      this.rainHighpassFilter.frequency.value = this.filters.windowOpenRainHighpass;
      this.rainLowpassFilter.frequency.value = this.filters.windowOpenRainLowpass;
      this.rainGain.gain.value = this.raining ? this.filters.windowOpenRainGain : 0;

      this.pan.pan.value = this.filters.windowOpenPan;

      this.cricketsGain.gain.value = this.filters.windowOpenCricketsGain;
      this.cricketsHighpassFilter.frequency.value = this.filters.windowOpenCricketsHighpass;
      this.cricketsLowpassFilter.frequency.value = this.filters.windowOpenCricketsLowpass;
      this.doveGain.gain.value = 0;
      this.loonGain.gain.value = 0;
    } else if (this.location == "inside") {
      this.rainHighpassFilter.frequency.value = this.filters.insideRainHighpass;
      this.rainLowpassFilter.frequency.value = this.filters.insideRainLowpass;
      this.rainGain.gain.value = this.raining ? this.filters.insideRainGain : 0;

      this.pan.pan.value = 0;

      this.cricketsGain.gain.value = 0;
      this.doveGain.gain.value = 0;
      this.loonGain.gain.value = 0;
    } else { 
      // (outside)
      this.rainHighpassFilter.frequency.value = this.highpassDisabled;
      this.rainLowpassFilter.frequency.value = this.lowpassDisabled;
      this.rainGain.gain.value = this.raining ? this.filters.outsideRainGain : 0;

      this.pan.pan.value = 0;

      this.cricketsGain.gain.value = this.filters.outsideCricketsGain;
      this.cricketsHighpassFilter.frequency.value = this.highpassDisabled;
      this.cricketsLowpassFilter.frequency.value = this.lowpassDisabled;

      this.pan.pan.value = 0;

      this.doveGain.gain.value = this.filters.outsideDovesGain;
      this.loonGain.gain.value = this.filters.outsideLoonsGain;
    }
  }

  toggleRain(raining: boolean) {
    this.raining = raining;
    this.adjustFilters();
    console.log(`[AmbientProcessor] Turned ${raining ? "on" : "off"} the rain`);
  }

  toggleWindow(windowOpen: boolean) {
    this.windowOpen = windowOpen;
    this.adjustFilters();
    console.log(`[AmbientProcessor] set window ${windowOpen ? "open" : "closed"}`);
  }
  
  toggleOutside(outside: boolean) {
    outside ? this.location = "outside" : this.location = "inside";
    this.adjustFilters();
    console.log(`[AmbientProcessor] set location to ${outside ? "outside" : "inside"}`);
  }

  playAmbientNature(today: Date) {
    const hour = today.getHours();
    if (hour < 6) { // 12am - 6am
      this.loonsAudio.play(); 
      this.cricketsAudio.play();
    } else if (hour < 12) { // 6am - 12pm
      this.dovesAudio.play();
    } else if (hour < 18) { // 12pm - 6pm
      this.dovesAudio.play();
    } else { // 6pm - 12am
      this.dovesAudio.play();
      this.loonsAudio.play(); 
      this.cricketsAudio.play();
    }
  }

  setVolume(volume: number) {
    this.masterGain.gain.value = volume;
  }
  
  play() {
    this.audioContext?.resume();
    this.playAmbientNature(new Date());
    this.rainAudio.play();
    console.log("[AmbientProcessor] playing");
  }

  stop() {
    this.audioContext?.suspend();
    this.rainAudio.pause();
    this.dovesAudio.pause();
    this.loonsAudio.pause();
    this.cricketsAudio.pause();
    console.log("[AmbientProcessor] stopped");
  }

}
