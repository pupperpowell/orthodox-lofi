#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

// Set build environment flag
Deno.env.set("FRESH_BUILD", "1");

await dev(import.meta.url, "./main.ts", config);
