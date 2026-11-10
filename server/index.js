import { createApp } from "./app.js";
import { config } from "./config.js";
import { providerStatus } from "./providers/index.js";
import { getDb } from "./db/store.js";

const app = createApp();

async function start() {
  await getDb();
  app.listen(config.port, () => {
    const provider = providerStatus();
    console.log("");
    console.log("  MASTERY API");
    console.log(`  http://localhost:${config.port}/api/health`);
    console.log(`  Provider: ${provider.label}`);
    console.log(`  Mastery threshold: ${config.masteryThreshold}% · Max attempts: ${config.maxAttempts}`);
    console.log("");
  });
}

start().catch((error) => {
  console.error("[MASTERY] Failed to start server:", error);
  process.exit(1);
});
