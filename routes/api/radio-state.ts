// routes/api/radio-state.ts
import { Handlers } from "$fresh/server.ts";
import {
  getRadioState,
  initializeRadio,
  togglePlayPause,
} from "../../utils/RadioState.ts";

// Initialize radio when the server starts
await initializeRadio();

export const handler: Handlers = {
  GET() {
    return new Response(JSON.stringify(getRadioState()), {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Allow admin control via POST
  async POST(req) {
    const body = await req.json();

    if (body.action === "toggle") {
      const state = togglePlayPause();
      return new Response(JSON.stringify(state), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  },
};
