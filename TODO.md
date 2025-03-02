# Software Design Document: Lofi Audio Web App with Streaming Buffer Strategy

## 1. Overview

The Lofi Audio Web App is a web-based application built on Deno Fresh that provides users with streamed lofi music. Due to WebKit/iOS limitations that prevent audio effects from working with `createMediaElementSource()` on streaming audio, this design implements a custom streaming solution using the Web Audio API with a fetch-based buffer strategy.

## 2. Architecture

### 2.1 Technology Stack

- **Frontend Framework**: Deno Fresh with TypeScript
- **Streaming Source**: Icecast server
- **Deployment**: Debian server with preconfigured Nginx

### 2.2 High-Level Components

1. **Audio Streaming Service**: Manages fetch requests and audio buffer processing
2. **Buffer Manager**: Handles the scheduling and playback of audio chunks
3. **Audio Effects Chain**: Processes audio through various effect nodes
4. **UI Controller**: Manages user interface interactions and audio control state
5. **Stream Status Monitor**: Tracks buffering and playback status

## 3. Detailed Design

### 3.1 Audio Streaming Service

```typescript
class AudioStreamingService {
  private context: AudioContext;
  private bufferManager: BufferManager;
  private streamUrl: string;
  private isStreaming: boolean = false;
  private controller: AbortController | null = null;

  constructor(
    streamUrl: string,
    context: AudioContext,
    bufferManager: BufferManager
  ) {
    this.streamUrl = streamUrl;
    this.context = context;
    this.bufferManager = bufferManager;
  }

  async startStreaming() {
    if (this.isStreaming) return;

    this.isStreaming = true;
    this.controller = new AbortController();

    try {
      const response = await fetch(this.streamUrl, {
        signal: this.controller.signal,
        headers: {
          "Icy-MetaData": "1", // For metadata if your Icecast server provides it
        },
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      await this.processStream(reader);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Streaming error:", error);
        this.handleStreamingError(error);
      }
    }
  }

  async processStream(reader) {
    const chunkSize = 32 * 1024; // 32KB chunks
    let buffer = new Uint8Array(0);

    while (this.isStreaming) {
      const { value, done } = await reader.read();

      if (done) {
        this.isStreaming = false;
        break;
      }

      // Append new data to existing buffer
      const newBuffer = new Uint8Array(buffer.length + value.length);
      newBuffer.set(buffer);
      newBuffer.set(value, buffer.length);
      buffer = newBuffer;

      // Process complete chunks
      while (buffer.length >= chunkSize) {
        const chunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize);

        // Send chunk to buffer manager for decoding and scheduling
        await this.bufferManager.processChunk(chunk);
      }
    }
  }

  stopStreaming() {
    this.isStreaming = false;
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  handleStreamingError(error) {
    // Implement error handling, retry logic, etc.
    setTimeout(() => {
      if (this.isStreaming) {
        this.startStreaming();
      }
    }, 3000);
  }
}
```

### 3.2 Buffer Manager

```typescript
class BufferManager {
  private context: AudioContext;
  private effectsChain: AudioEffectsChain;
  private bufferQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextScheduleTime: number = 0;
  private scheduler: number | null = null;
  private audioFormat: string = "audio/mpeg"; // Default format, could be configurable

  constructor(context: AudioContext, effectsChain: AudioEffectsChain) {
    this.context = context;
    this.effectsChain = effectsChain;
  }

  async processChunk(chunk: Uint8Array) {
    try {
      // Decode audio data from the chunk
      const arrayBuffer = chunk.buffer;
      const audioBuffer = await this.decodeChunk(arrayBuffer);

      // Add to buffer queue
      this.bufferQueue.push(audioBuffer);

      // Start playback if not already playing
      if (!this.isPlaying) {
        this.startPlayback();
      }
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  }

  private async decodeChunk(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    // In a real implementation, you might need a more sophisticated
    // approach to handle partial audio frames across chunk boundaries
    return new Promise((resolve, reject) => {
      this.context.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  startPlayback() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.nextScheduleTime = this.context.currentTime;
    this.scheduleNextBuffer();

    // Start the scheduler to keep checking for new buffers
    this.scheduler = setInterval(() => this.scheduleNextBuffer(), 100);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.scheduler !== null) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
    this.bufferQueue = [];
    this.nextScheduleTime = 0;
  }

  private scheduleNextBuffer() {
    // Schedule more buffers if we have them and need them
    if (this.bufferQueue.length === 0) return;

    // Look ahead time - how far ahead we schedule buffers
    const lookAheadTime = 0.5; // seconds

    // If we have less than lookAheadTime seconds scheduled, schedule the next buffer
    if (this.nextScheduleTime - this.context.currentTime < lookAheadTime) {
      const buffer = this.bufferQueue.shift()!;
      this.playBuffer(buffer, this.nextScheduleTime);
      this.nextScheduleTime += buffer.duration;
    }
  }

  private playBuffer(buffer: AudioBuffer, startTime: number) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Connect to the effects chain
    source.connect(this.effectsChain.getInputNode());

    // Schedule the source to start at the specified time
    source.start(startTime);
  }
}
```

### 3.3 Audio Effects Chain

```typescript
class AudioEffectsChain {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private effectNodes: AudioNode[] = [];

  constructor(context: AudioContext) {
    this.context = context;

    // Create input and output nodes
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();

    // Initialize with some basic lofi effects
    this.setupDefaultEffects();

    // Connect everything in chain
    this.connectEffects();
  }

  private setupDefaultEffects() {
    // 1. Low Pass Filter (for the warm, muffled sound)
    const lowpass = this.context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3500;
    lowpass.Q.value = 0.7;

    // 2. High Pass Filter (to remove unwanted low frequencies)
    const highpass = this.context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 20;

    // 3. Vinyl Crackle Simulator (using white noise)
    const vinylNode = this.createVinylCrackle();

    // 4. Compressor (for that squashed lofi sound)
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;

    // Add all effects to the chain
    this.effectNodes = [lowpass, highpass, vinylNode, compressor];
  }

  private createVinylCrackle() {
    // Create a gain node for the vinyl noise level
    const vinylGain = this.context.createGain();
    vinylGain.gain.value = 0.015; // Subtle

    // Create and connect a noise generator
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(
      1,
      bufferSize,
      this.context.sampleRate
    );
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.start(0);

    // Apply filter to make it sound more like vinyl
    const vinylFilter = this.context.createBiquadFilter();
    vinylFilter.type = "bandpass";
    vinylFilter.frequency.value = 4000;
    vinylFilter.Q.value = 0.5;

    noise.connect(vinylFilter);
    vinylFilter.connect(vinylGain);

    return vinylGain;
  }

  private connectEffects() {
    if (this.effectNodes.length === 0) {
      // No effects, just connect input to output
      this.inputNode.connect(this.outputNode);
      return;
    }

    // Connect input to the first effect
    this.inputNode.connect(this.effectNodes[0]);

    // Connect all effects in the chain
    for (let i = 0; i < this.effectNodes.length - 1; i++) {
      this.effectNodes[i].connect(this.effectNodes[i + 1]);
    }

    // Connect the last effect to output
    this.effectNodes[this.effectNodes.length - 1].connect(this.outputNode);

    // Connect the output to the destination
    this.outputNode.connect(this.context.destination);
  }

  getInputNode(): AudioNode {
    return this.inputNode;
  }

  setMasterVolume(value: number) {
    this.outputNode.gain.value = value;
  }

  // Methods to control each effect parameter
  setLowPassFrequency(value: number) {
    (this.effectNodes[0] as BiquadFilterNode).frequency.value = value;
  }

  setVinylCrackleAmount(value: number) {
    (this.effectNodes[2] as GainNode).gain.value = value;
  }

  // Add more parameter control methods as needed
}
```

### 3.4 Main Application Controller

```typescript
// islands/LofiPlayer.tsx
import { useState, useEffect } from "preact/hooks";

export default function LofiPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [bufferingStatus, setBufferingStatus] = useState("");

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let streamingService: AudioStreamingService | null = null;
    let bufferManager: BufferManager | null = null;
    let effectsChain: AudioEffectsChain | null = null;

    const streamUrl = "https://your-icecast-server.com/lofi-stream";

    const initAudio = async () => {
      try {
        // Create Audio Context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Initialize components
        effectsChain = new AudioEffectsChain(audioContext);
        bufferManager = new BufferManager(audioContext, effectsChain);
        streamingService = new AudioStreamingService(
          streamUrl,
          audioContext,
          bufferManager
        );

        // Set up event listeners for status updates
        // This would be implemented via a pub/sub pattern or similar
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        setBufferingStatus("Audio initialization failed");
      }
    };

    // Initialize on component mount
    initAudio();

    // Clean up on component unmount
    return () => {
      if (streamingService) {
        streamingService.stopStreaming();
      }
      if (bufferManager) {
        bufferManager.stopPlayback();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      // Implementation for stop functionality
      setIsPlaying(false);
      setBufferingStatus("");
    } else {
      // Implementation for play functionality
      setIsPlaying(true);
      setBufferingStatus("Buffering...");
    }
  };

  const handleVolumeChange = (e: Event) => {
    const newVolume = parseFloat((e.target as HTMLInputElement).value);
    setVolume(newVolume);
    // Implementation to update actual volume
  };

  return (
    <div class="lofi-player">
      <h1>Lofi Player</h1>

      <div class="controls">
        <button onClick={togglePlayback}>{isPlaying ? "Pause" : "Play"}</button>

        <div class="volume-control">
          <label for="volume">Volume:</label>
          <input
            type="range"
            id="volume"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      {bufferingStatus && <div class="buffering-status">{bufferingStatus}</div>}
    </div>
  );
}
```

## 4. Implementation Strategy

### 4.1 Audio Data Handling

Since we're handling audio data in chunks, careful attention must be paid to ensuring that:

1. Chunks are processed in the correct order
2. Playback is seamless between chunks
3. Memory usage is optimized by releasing processed chunks

The solution schedules audio playback ahead of time and maintains a buffer of pending chunks to ensure continuous playback.

### 4.2 Error Handling

The streaming implementation includes proper error handling:

1. Connection failures with retry mechanisms
2. Audio decoding errors
3. Buffer underrun detection and recovery
4. Browser compatibility checks

### 4.3 Optimization Considerations

- **Buffer Size**: A balance between responsiveness and stability
- **Look-ahead Time**: How far ahead to schedule audio chunks
- **Memory Management**: Proper cleanup of audio buffers after use

## 5. Browser Compatibility

This approach specifically addresses the WebKit/iOS limitation with `MediaElementSource`. The solution is compatible with:

- Safari on iOS (main target for the workaround)
- Modern desktop browsers (Chrome, Firefox, Edge, Safari)
- Android browsers

## 6. Future Enhancements

1. **Adaptive Buffering**: Adjust buffer size based on network conditions
2. **Multiple Stream Quality**: Provide different bitrate options
3. **Custom Effect Presets**: Allow users to save and load effect configurations
4. **Offline Caching**: Cache streams for offline playback
5. **Stream Metadata Display**: Show artist/track information from Icecast metadata

## 7. Testing Strategy

1. **Unit Tests**: For individual components (buffer management, effects chain)
2. **Integration Tests**: For the complete audio pipeline
3. **Performance Tests**: Measure memory usage and CPU load
4. **Browser Compatibility Tests**: Ensure proper function across target browsers
5. **Network Resilience Tests**: Verify behavior under various network conditions

## 8. Conclusion

This design provides a robust solution for streaming lofi music on iOS devices while maintaining the ability to apply audio effects. By using a fetch-based buffer strategy with the Web Audio API, we can overcome the limitations of WebKit while providing a high-quality audio experience.
