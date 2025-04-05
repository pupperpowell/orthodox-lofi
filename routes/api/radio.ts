// A server TS file that keeps track of an internal "radio" state.
import { FreshContext } from "$fresh/server.ts";

// ✅ Loads audio files from directory on server start
// ✅ Keeps track of current track, duration, and progress
// ✅ Loads next track when current track ends

export type Radio = {
  currentTrack: AudioTrack;
  progress: number;
  isPlaying: boolean;
};

export type AudioTrack = {
  path: string;
  duration: number;
};

// Store all active WebSocket connections
const clients = new Set<WebSocket>();

const DEV_ENV = Deno.env.get("ENVIRONMENT") === "DEV";
export const AUDIO_DIRECTORY = DEV_ENV
  ? "./static/audio"
  : "/home/george/media/orthodox/albums";

// Track the current file being served to all clients
let currentTrack: AudioTrack | null = null;
// Track the index of the current file in the files array
let currentTrackIndex = 0;
// Store all available files
let audioFiles: AudioTrack[] = [];

// This variable is how often the current track is updated
// Also used to start playback once when the server starts
let progressInterval: number | null = null;

export const radio: Radio = {
  currentTrack: {
    path: "",
    duration: 0,
  },
  progress: 0,
  isPlaying: false,
};

// Initialize the files array and current file at startup
(async () => {
  audioFiles = await loadAudioFiles();
  if (audioFiles.length > 0) {
    currentTrack = audioFiles[0];
  }
  startPlayback();
})();

// Runs when audio files are loaded
async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const command = new Deno.Command("ffprobe", {
      args: [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      stdout: "piped",
    });

    const { stdout } = await command.output();
    const output = new TextDecoder().decode(stdout).trim();
    const duration = parseFloat(output);
    return isNaN(duration) ? 180 : duration;
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return 180;
  }
}

// Returns an array of AudioTrack objects
// Runs once on server start
async function loadAudioFiles(): Promise<AudioTrack[]> {
  async function traverseDirectory(dirPath: string) {
    for await (const entry of Deno.readDir(dirPath)) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isFile && entry.name.toLowerCase()) {
        const relativePath = fullPath.replace(AUDIO_DIRECTORY, "");
        const duration = await getAudioDuration(fullPath);
        audioFiles.push({
          path: relativePath,
          duration: duration,
        });
      } else if (entry.isDirectory) {
        await traverseDirectory(fullPath);
      }
    }
  }

  try {
    await traverseDirectory(AUDIO_DIRECTORY);
    return audioFiles.sort((a, b) => a.path.localeCompare(b.path));
  } catch (error) {
    console.error("Error reading audio directory:", error);
    return [];
  }
}

// Get the next file in sequence
function getNextAudioFile(): AudioTrack {
  const track = audioFiles[currentTrackIndex];
  currentTrackIndex = (currentTrackIndex + 1) % audioFiles.length;
  return track;
}

function startPlayback() {
  if (progressInterval !== null) return;

  radio.currentTrack = getNextAudioFile();
  radio.isPlaying = true;

  progressInterval = setInterval(() => {
    // Increment the current progress
    radio.progress += 1;

    // If we reached the end of the track, change to a new one
    if (radio.progress >= radio.currentTrack.duration) {
      radio.currentTrack = getNextAudioFile();
      radio.progress = 0;
    }

    // Send the radio state to all connected clients
    broadcastMessage(radio);
  }, 1000); // Update every second

  function broadcastMessage(message: object) {
    const messageStr = JSON.stringify(message);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    }
  }
}

// This is the main function that handles the WebSocket connection
export const handler = (req: Request, _ctx: FreshContext): Response => {
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    clients.add(socket);
    console.log(`WebSocket client connected (${clients.size} total)`);

    // Send current state to the new client
    socket.send(JSON.stringify(radio));

    // Start playback
    if (!radio.isPlaying) {
      startPlayback();
    }
  };

  socket.onclose = () => {
    clients.delete(socket);
  };

  socket.onerror = (e) => {
    console.error("WebSocket error:", e);
    clients.delete(socket);
  };

  // Handle client messages
  socket.onmessage = (e) => {
    const message = JSON.parse(e.data);
    console.log("Received message:", message);
  };

  return response;
};
