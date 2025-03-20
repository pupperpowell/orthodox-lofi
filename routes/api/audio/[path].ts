// routes/api/audio/[path].ts - Serve individual audio files
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { path } = ctx.params;
    const audioPath = `./static/audio/${path}`;

    try {
      const file = await Deno.open(audioPath, { read: true });
      const fileInfo = await Deno.stat(audioPath);

      // Set appropriate headers for audio streaming
      const headers = new Headers({
        "Content-Type": "audio/mpeg",
        "Content-Length": fileInfo.size.toString(),
        "Accept-Ranges": "bytes",
      });

      return new Response(file.readable, { headers });
    } catch (e) {
      console.error("Error serving audio:", e);
      return new Response("Audio file not found", { status: 404 });
    }
  },
};
