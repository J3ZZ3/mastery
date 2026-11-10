import { config } from "../config.js";
import { demoProvider } from "./demoProvider.js";
import { openaiProvider } from "./openaiProvider.js";

export const providerStatus = () => {
  const wantsOpenAI = config.aiProvider === "openai";
  const hasKey = Boolean(config.openai.apiKey);
  const active = wantsOpenAI && hasKey ? "openai" : "demo";

  return {
    active,
    requested: wantsOpenAI ? "openai" : "demo",
    label:
      active === "openai"
        ? `OpenAI-compatible · ${config.openai.model}`
        : "Deterministic demo engine",
    aiConfigured: active === "openai",
    note:
      active === "openai"
        ? "Agent calls use the configured chat-completions endpoint with a deterministic fallback."
        : wantsOpenAI && !hasKey
          ? "AI_PROVIDER=openai but OPENAI_API_KEY is missing, so the deterministic demo engine is active."
          : "No model calls are made. Every agent computes real results from the submitted answers.",
  };
};

export const getAiProvider = () => {
  const status = providerStatus();
  return status.active === "openai" ? openaiProvider : demoProvider;
};
