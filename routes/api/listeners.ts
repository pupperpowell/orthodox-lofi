// routes/api/listeners.ts

/**
 * API Endpoint: Listener Count Tracker
 *
 * This endpoint provides the current number of active listeners for the Orthodox Lofi stream.
 *
 * How it works:
 * 1. When a GET request is made to /api/listeners, this handler retrieves the current
 *    listener count from the global listener tracker (imported from "../../listeners.ts")
 * 2. It logs the request with the requester's IP and current listener count for monitoring
 * 3. It returns a JSON response with:
 *    - count: The current number of active listeners
 *    - timestamp: The current server time in milliseconds
 *
 * Integration with the application:
 * - This endpoint is consumed by the ActiveListeners island component to display real-time
 *   listener counts on the frontend
 * - The listener tracker is updated elsewhere in the application when users connect/disconnect
 *   from the audio streams
 * - CORS headers are included to allow this API to be called from browsers
 * - Cache control headers prevent browsers from caching the response to ensure fresh data
 */

import { Handlers } from "$fresh/server.ts";
import { getListenerTracker } from "../../listeners.ts";

export const handler: Handlers = {
  GET(req, ctx) {
    const count = getListenerTracker().getCount();
    console.log(
      `[ListenersAPI] Request from ${ctx.remoteAddr.hostname} - Current listeners: ${count}`,
    );

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
