import "dotenv/config";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: asNumber(process.env.PORT, 8787),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  aiProvider: (process.env.AI_PROVIDER || "demo").toLowerCase(),
  masteryThreshold: asNumber(process.env.MASTERY_THRESHOLD, 80),
  demoDelayMs: asNumber(process.env.DEMO_DELAY_MS, 450),
  maxAttempts: 2,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    timeoutMs: asNumber(process.env.OPENAI_TIMEOUT_MS, 18000),
  },
};
