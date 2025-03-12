// routes/api/audio/[stream].ts
import { Handlers } from "$fresh/server.ts";
import { listenerTracker } from "../../../listeners.ts";

// Add at the top of the file, after imports
console.log("[StreamHandler] Module initialized");

export const handler: Handlers = {
  async GET(req, ctx) {
    const userAgent = req.headers.get("user-agent") || "";

    const streamName = ctx.params.stream;
    console.log(
      `[StreamHandler] New request for stream: ${streamName} from ${ctx.remoteAddr.hostname}`,
    );

    // Generate a connection ID and track this listener
    const connectionId = listenerTracker.addListener(ctx.remoteAddr, userAgent);

    // Set a cookie with the connection ID
    const headers = new Headers({
      "Set-Cookie":
        `stream_connection=${connectionId}; Path=/; SameSite=Strict; HttpOnly`,
    });

    // Proxy the actual request to your Icecast server
    console.log(
      `[StreamHandler] Proxying request to Icecast for stream: ${streamName}`,
    );

    // Use the stream parameter to determine the actual stream URL
    const icecastBaseUrl = ((Deno.env.get("ENVIRONMENT") == "DEV") &&
      "https://lofi.george.wiki") ||
      "http://localhost:1025";

    console.log(`[StreamHandler] Icecast base URL: ${icecastBaseUrl}`);
    const streamUrl = `${icecastBaseUrl}/${streamName}`;

    console.log(`[StreamHandler] Requesting stream from: ${streamUrl}`);

    try {
      const response = await fetch(streamUrl, {
        headers: req.headers,
      });

      // Copy all headers from the Icecast response
      response.headers.forEach((value, key) => {
        headers.set(key, value);
      });

      // Create a TransformStream to intercept when the connection closes
      const { readable, writable } = new TransformStream();

      // Pipe the response body to our transform stream
      response.body?.pipeTo(writable).catch((error) => {
        // Connection closed, remove the listener
        console.log(
          `[StreamHandler] Stream connection closed: ${connectionId}`,
        );
        console.log(
          `[StreamHandler] Error (if any): ${
            error instanceof Error ? error.message : "No error"
          }`,
        );
        listenerTracker.removeListener(connectionId);
      });

      console.log(
        `[StreamHandler] Returning stream response to client: ${connectionId}`,
      );

      return new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error(
        `[StreamHandler] Error proxying stream: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return new Response(
        `Stream error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { status: 500 },
      );
    }
  },
};
