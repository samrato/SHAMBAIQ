import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  const weatherAIBaseUrl = process.env.WEATHERAI_BASE_URL ?? "https://api.weather-ai.co";
  const weatherAIAPIKey = process.env.WEATHERAI_API_KEY;
  const aiThrottleRemaining = Number(process.env.WEATHERAI_AI_THROTTLE_REMAINING ?? 50);

  return {
    nodeEnv: process.env.NODE_ENV,
    shambaIqPublicUrl: process.env.SHAMBAIQ_PUBLIC_URL ?? "http://localhost:3000",
    weatherAI: {
      baseUrl: weatherAIBaseUrl.replace(/\/$/, ""),
      apiKey: weatherAIAPIKey,
      configured: Boolean(weatherAIAPIKey),
      aiThrottleRemaining: Number.isFinite(aiThrottleRemaining) ? aiThrottleRemaining : 50,
    },
  };
}
