// routes/api/music.ts

import { FreshContext } from "$fresh/server.ts";

// Directory containing audio files
const MP3_DIRECTORY = "./static/audio/";

// Track the current file being served to all clients
let currentFilePath: string | null = null;
// Track the index of the current file in the files array
let currentFileIndex = 0;
// Store all available files
let audioFiles: string[] = [];

// Function to load all audio files from the directory
async function loadAudioFiles(): Promise<string[]> {
  try {
    const files = [];
    for await (const entry of Deno.readDir(MP3_DIRECTORY)) {
      if (entry.isFile) {
        files.push(entry.name);
      }
    }
    console.log("Loaded audio files:", files);

    // Sort files alphabetically to ensure consistent order
    return files.sort();
  } catch (error) {
    console.error("Error reading audio directory:", error);
    return [];
  }
}

// Function to get the next file in sequence
function getNextAudioFile(): string | null {
  if (audioFiles.length === 0) return null;

  // Get the file at the current index
  const fileName = audioFiles[currentFileIndex];

  // Increment the index for next time, wrapping around if needed
  currentFileIndex = (currentFileIndex + 1) % audioFiles.length;

  console.log("File playing now:", fileName);
  return MP3_DIRECTORY + fileName;
}

// Initialize the files array and current file at startup
(async () => {
  audioFiles = await loadAudioFiles();
  if (audioFiles.length > 0) {
    currentFilePath = MP3_DIRECTORY + audioFiles[0];
    // console.log(`Selected initial audio file: ${currentFilePath}`);
  }
})();

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  try {
    // If no file is selected yet, try to select one
    if (!currentFilePath) {
      // Reload files if needed
      if (audioFiles.length === 0) {
        audioFiles = await loadAudioFiles();
      }

      currentFilePath = getNextAudioFile();

      if (!currentFilePath) {
        return new Response("No audio files available", { status: 404 });
      }
    }

    // Read the file
    const file = await Deno.open(currentFilePath, { read: true });
    const readableStream = file.readable;

    // Set up the next file for the next request
    currentFilePath = getNextAudioFile();

    return new Response(readableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving audio:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
