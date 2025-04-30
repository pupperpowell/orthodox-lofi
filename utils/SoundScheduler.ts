export class SoundScheduler {
    private raining: boolean;
    private timeoutId: number | null = null;
    private active: boolean = false; // Track if scheduler is running
  
    constructor(raining: boolean) {
      this.raining = raining;
    }
  
    start() {
      if (this.active) return; // Prevent multiple starts
      this.active = true;
      this.scheduleNext();
    }
  
    stop() {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.active = false;
    }
  
    // Dynamically update the 'raining' state and recalculate the schedule
    updateRainingState(isRaining: boolean) {
      if (this.raining !== isRaining) {
        this.raining = isRaining;
        if (this.active) {
          this.scheduleNext(); // Reschedule immediately after state change
        }
      }
    }
  
    private scheduleNext() {
      const interval = this.getNextInterval(); // in ms
      this.timeoutId = setTimeout(() => {
        this.playRandomBirdCall();
        if (this.active) this.scheduleNext(); // recurse if still active
      }, interval);
    }
  
    private getNextInterval(): number {
      const λ = this.getLambda(); // calls per minute
      const seconds = -Math.log(1 - Math.random()) / λ;
      return seconds * 1000; // convert to ms
    }
  
    private getLambda(): number {
      const hour = new Date().getHours();
  
      // Define base activity rate (calls per minute)
      let baseRate = (hour >= 5 && hour <= 8) ? 0.5   // Dawn chorus
                    : (hour >= 9 && hour <= 17) ? 0.2  // Daytime
                    : 0.05;                            // Nighttime
  
      if (this.raining) baseRate *= 0.4; // Reduce activity in rain
  
      return baseRate; // This is λ (calls/sec)
    }
  
    private playRandomBirdCall() {
      const birdCalls = ['sparrow.mp3', 'robin.mp3', 'finch.mp3'];
      const call = birdCalls[Math.floor(Math.random() * birdCalls.length)];
      const audio = new Audio(`/sounds/${call}`);
      audio.play();
    }
  }
  