// utils/radioState.ts - Manages the global radio state
export interface RadioState {
  currentTrack: string;
  startedAt: number; // timestamp when the current track started
  duration: number; // track duration in seconds
  playlist: Track[];
  isPlaying: boolean;
}

export interface Track {
  id: string;
  title: string;
  path: string;
  duration: number; // in seconds
}

// Global radio state
let radioState: RadioState = {
  currentTrack: "",
  startedAt: Date.now(),
  duration: 0,
  playlist: [],
  isPlaying: false,
};

// Interval for logging track information
let loggingInterval: number | null = null;

// Initialize with some tracks (runs when Deno server starts)
export function initializeRadio() {
  // You would typically load this from a database or file system
  const tracks: Track[] = [
    { id: "1", title: "Song 1", path: "rain.wav", duration: 10 },
    { id: "2", title: "Song 2", path: "echoey-church-hall.wav", duration: 10 },
  ];
  console.log("Initializing radio with tracks");

  radioState.playlist = tracks;
  radioState.currentTrack = tracks[0].id;
  radioState.duration = tracks[0].duration;
  radioState.startedAt = Date.now();
  radioState.isPlaying = true;

  // Start the radio scheduler
  scheduleNextTrack();

  startLoggingInterval();
}

function startLoggingInterval() {
  // Clear any existing interval
  if (loggingInterval !== null) {
    clearInterval(loggingInterval);
  }

  // Set up a new interval that logs every second
  loggingInterval = setInterval(() => {
    if (radioState.isPlaying) {
      const currentTrackObj = radioState.playlist.find((t) =>
        t.id === radioState.currentTrack
      );
      const elapsedSeconds = Math.floor(
        (Date.now() - radioState.startedAt) / 1000,
      );
      console.log(
        `Current track: ${
          currentTrackObj?.title || "Unknown"
        }, Time elapsed: ${elapsedSeconds}s / ${radioState.duration}s`,
      );
    }
  }, 1000);
}

function scheduleNextTrack() {
  if (!radioState.isPlaying) return;

  const currentTrackIndex = radioState.playlist.findIndex((t) =>
    t.id === radioState.currentTrack
  );
  const currentTrack = radioState.playlist[currentTrackIndex];

  // Schedule the next track
  setTimeout(() => {
    const nextIndex = (currentTrackIndex + 1) % radioState.playlist.length;
    radioState.currentTrack = radioState.playlist[nextIndex].id;
    radioState.duration = radioState.playlist[nextIndex].duration;
    radioState.startedAt = Date.now();

    // Schedule the next track after this one
    scheduleNextTrack();
  }, currentTrack.duration * 1000);
}

export function getRadioState(): RadioState {
  // Calculate current position in the track
  const currentPosition = (Date.now() - radioState.startedAt) / 1000;

  // If we've somehow passed the duration, move to the next track
  // (this handles edge cases like server sleep)
  if (currentPosition > radioState.duration) {
    const currentTrackIndex = radioState.playlist.findIndex((t) =>
      t.id === radioState.currentTrack
    );
    const nextIndex = (currentTrackIndex + .1) % radioState.playlist.length;
    radioState.currentTrack = radioState.playlist[nextIndex].id;
    radioState.duration = radioState.playlist[nextIndex].duration;
    radioState.startedAt = Date.now();
    scheduleNextTrack();
  }

  return radioState;
}

export function togglePlayPause() {
  radioState.isPlaying = !radioState.isPlaying;
  if (radioState.isPlaying) {
    // We're resuming, reset the startedAt time
    radioState.startedAt = Date.now();
    scheduleNextTrack();
  }
  return radioState;
}
