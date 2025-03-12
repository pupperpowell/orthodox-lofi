/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import "$std/dotenv/load.ts";
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

// Set runtime environment flag (this will only be executed at runtime)
Deno.env.set("FRESH_RUNTIME", "1");
// Clear any build flags that might be set
Deno.env.delete("FRESH_BUILD");

// Get the port from environment variable or use 1054 as default
const port = parseInt(Deno.env.get("PORT") || "1054");

// Add the port to the config
await start(manifest, { ...config, port });
