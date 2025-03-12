// routes/api/listeners.ts
import { Handlers } from "$fresh/server.ts";
import { listenerTracker } from "../../listeners.ts";

export const handler: Handlers = {
  GET(req, ctx) {
    const count = listenerTracker.getCount();
    console.log(`[ListenersAPI] Request from ${ctx.remoteAddr.hostname} - Current listeners: ${count}`);
    
    // Add CORS headers to allow browser fetching
    return new Response(
      JSON.stringify({
        count,
        timestamp: Date.now(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  },
};
