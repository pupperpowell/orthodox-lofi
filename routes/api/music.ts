// routes/api/music.ts

// Returns a full audio file on request

import { FreshContext } from "$fresh/server.ts";
import { AUDIO_DIRECTORY, radio } from "./radio.ts";

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  try {
    // Get the track path from the URL or use the current track
    const url = new URL(req.url);
    const requestedPath = url.searchParams.get("path");

    // Use the requested path or fall back to the current track
    const trackPath = requestedPath || radio.currentTrack.path;

    if (!trackPath) {
      return new Response("No track specified", { status: 400 });
    }

    // Read the file
    const fullPath = `${AUDIO_DIRECTORY}${trackPath}`;
    const file = await Deno.open(fullPath, { read: true });
    const readableStream = file.readable;

    // Determine content type based on file extension
    let contentType = "audio/mpeg"; // default
    if (trackPath.endsWith(".wav")) {
      contentType = "audio/wav";
    } else if (trackPath.endsWith(".webm")) {
      contentType = "audio/webm";
    } else if (trackPath.endsWith(".ogg")) {
      contentType = "audio/ogg";
    } else if (trackPath.endsWith(".mp3")) {
      contentType = "audio/mpeg";
    }

    console.log(
      "Returning the file " + fullPath + " with content type " + contentType,
    );

    return new Response(readableStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving audio:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
