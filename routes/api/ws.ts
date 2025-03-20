// routes/api/ws.ts
import { FreshContext } from "$fresh/server.ts";

// Store all active WebSocket connections
const clients = new Set<WebSocket>();

// Track playback state
let isPlaying = false;
let currentProgress = 0;
let currentTrackDuration = 180; // Default 3 minutes in seconds
let progressInterval: number | null = null;

// Function to select a new track
async function changeTrack() {
  // Reset progress
  currentProgress = 0;

  // Broadcast track change to all clients
  broadcastMessage({
    type: "trackChange",
    currentTime: 0,
  });
}

function startPlayback() {
  if (progressInterval !== null) return;

  isPlaying = true;
  progressInterval = setInterval(() => {
    // Update progress in seconds
    currentProgress += 1;

    // If we reached the end of the track, change to a new one
    if (currentProgress >= currentTrackDuration) {
      changeTrack();
    } else {
      // Broadcast current position to all clients
      broadcastMessage({
        type: "progress",
        currentTime: currentProgress,
        isPlaying: true,
      });
    }

    // If no clients are connected, stop the interval
    if (clients.size === 0 && progressInterval !== null) {
      clearInterval(progressInterval);
      progressInterval = null;
      isPlaying = false;
    }
  }, 1000); // Update every second
}

function pausePlayback() {
  if (progressInterval !== null) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  isPlaying = false;

  // Broadcast pause state
  broadcastMessage({
    type: "progress",
    currentTime: currentProgress,
    isPlaying: false,
  });
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
    }));

    // Start playback if this is the first client and we're not already playing
    if (clients.size === 1 && !isPlaying) {
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
        currentTrackDuration = data.duration;
        console.log(`Track duration set to ${currentTrackDuration} seconds`);
      }

      // Handle player commands (you could add more)
      if (data.type === "command") {
        if (data.action === "next") {
          changeTrack();
        } else if (data.action === "play") {
          startPlayback();
        } else if (data.action === "pause") {
          pausePlayback();
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  return response;
};
