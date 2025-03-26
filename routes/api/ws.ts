// routes/api/ws.ts
import { FreshContext } from "$fresh/server.ts";

// Store all active WebSocket connections
const clients = new Set<WebSocket>();

// Track playback state
let isPlaying = false;
let currentProgress = 0;
let currentTrackDuration = 180; // Default 3 minutes in seconds
let progressInterval: number | null = null;

// Import the MP3 directory path from music.ts
const MP3_DIRECTORY = "./static/audio/";
let currentFilePath: string | null = null;

// Function to get audio duration using ffprobe
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
    console.log("Audio duration:", duration);

    return isNaN(duration) ? 180 : duration; // Return default 180 if parsing fails
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return 180; // Default duration on error
  }
}
// Function to select a new track
async function changeTrack() {
  // Reset progress
  currentProgress = 0;

  try {
    // Use a complete URL with protocol, host, etc.
    // Since this is server-side code, we can't use window.location
    // Instead, let's directly access the file system

    const entries = [];
    try {
      for await (const entry of Deno.readDir(MP3_DIRECTORY)) {
        if (entry.isFile) {
          entries.push(entry.name);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${MP3_DIRECTORY}:`, error);
      throw error;
    }

    if (entries.length === 0) {
      console.error("No MP3 files found in directory");
      throw new Error("No MP3 files found");
    }

    // Select a random file
    const randomIndex = Math.floor(Math.random() * entries.length);
    const selectedFile = entries[randomIndex];
    currentFilePath = `${MP3_DIRECTORY}${selectedFile}`;

    console.log(`Selected new track: ${currentFilePath}`);

    // Get the duration of the new track
    currentTrackDuration = await getAudioDuration(currentFilePath);
    console.log(
      `New track: ${selectedFile}, duration: ${currentTrackDuration} seconds`,
    );

    // Broadcast track change to all clients
    broadcastMessage({
      type: "trackChange",
      currentTime: 0,
      file: selectedFile,
      duration: currentTrackDuration,
    });
  } catch (error) {
    console.error("Error changing track:", error);

    // Broadcast track change with default values on error
    broadcastMessage({
      type: "trackChange",
      currentTime: 0,
    });
  }
}

function startPlayback() {
  if (progressInterval !== null) return;

  isPlaying = true;
  progressInterval = setInterval(() => {
    // Update progress in seconds
    currentProgress += 1;

    // If we reached the end of the track, change to a new one
    if (currentProgress >= currentTrackDuration) {
      console.log("Reached end of track, changing to a new one");
      changeTrack();
    } else {
      // Broadcast current position to all clients
      broadcastMessage({
        type: "progress",
        currentTime: currentProgress,
        isPlaying: true,
      });
    }
  }, 1000); // Update every second
}

function broadcastMessage(message: object) {
  const messageStr = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  }
}

export const handler = (req: Request, _ctx: FreshContext): Response => {
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    clients.add(socket);
    console.log(`WebSocket client connected (${clients.size} total)`);

    // Send current state to the new client
    socket.send(JSON.stringify({
      type: "progress",
      currentTime: currentProgress,
      isPlaying,
      duration: currentTrackDuration,
    }));

    // Start playback
    if (!isPlaying) {
      startPlayback();
    }
  };

  socket.onclose = () => {
    clients.delete(socket);
    console.log(`WebSocket client disconnected (${clients.size} remaining)`);
  };

  socket.onerror = (e) => {
    console.error("WebSocket error:", e);
    clients.delete(socket);
  };

  // Handle client messages
  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      // Client can report the duration of the current track
      if (data.type === "trackLoaded" && typeof data.duration === "number") {
        // Allow client to override duration if needed
        currentTrackDuration = data.duration;
        console.log(
          `Track duration updated to ${currentTrackDuration} seconds by client`,
        );
      }

      // Handle player commands (you could add more)
      if (data.type === "command") {
        if (data.action === "next") {
          changeTrack();
        } else if (data.action === "play") {
          startPlayback();
        } else if (data.action === "pause") {
          // pausePlayback();
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  return response;
};
