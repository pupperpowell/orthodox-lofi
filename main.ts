/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import "$std/dotenv/load.ts";
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

// Get the port from environment variable or use 8000 as default
const port = parseInt(Deno.env.get("PORT") || "8000");

// Add the port to the config
await start(manifest, { ...config, port });
