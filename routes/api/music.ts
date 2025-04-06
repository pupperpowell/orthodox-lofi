// routes/api/music.ts
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
    // Get file information so we can set Content-Length header
    const fileInfo = await Deno.stat(fullPath);
    const fileSize = fileInfo.size;

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

    // Handle range requests
    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      // Parse the range header
      const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);

      if (!matches) {
        return new Response("Invalid range header", { status: 400 });
      }

      const start = parseInt(matches[1], 10);
      // If end is not specified, use the file size - 1
      const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize || start > end) {
        return new Response(
          "Range Not Satisfiable",
          {
            status: 416,
            headers: {
              "Content-Range": `bytes */${fileSize}`,
            },
          },
        );
      }

      const contentLength = end - start + 1;

      // Open file and seek to the start position
      const file = await Deno.open(fullPath, { read: true });

      // Seek to the start position
      await file.seek(start, Deno.SeekMode.Start);

      // Create a readable stream that only reads the requested range
      const readableStream = file.readable.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk.slice(0, contentLength));
          },
          flush() {
            file.close();
          },
        }),
      );

      return new Response(readableStream, {
        status: 206, // Partial Content
        headers: {
          "Content-Type": contentType,
          "Content-Length": contentLength.toString(),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store no-cache",
        },
      });
    } else {
      // No range requested, serve the entire file
      const file = await Deno.open(fullPath, { read: true });
      const readableStream = file.readable;

      return new Response(readableStream, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": fileSize.toString(),
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store no-cache",
        },
      });
    }
  } catch (error) {
    console.error("Error serving audio:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
