import { config } from "../config.js";
import { sleep, withTimeout } from "../lib/async.js";

const extractJson = (content) => {
  if (typeof content !== "string") {
    throw new Error("Model response did not contain text");
  }

  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }

  return JSON.parse(candidate.slice(start, end + 1));
};

/**
 * OpenAI-compatible chat completions provider.
 * Every agent passes a deterministic fallback so a model or network
 * failure degrades gracefully and never breaks the learning cycle.
 */
export const openaiProvider = {
  id: "openai",
  label: `OpenAI-compatible (${config.openai.model})`,

  async generateJSON({ schema, fallback, instructions, payload, label, latencyMs = 0 }) {
    const startedAt = Date.now();

    try {
      if (latencyMs > 0) {
        // Keep the demo pacing even when a real provider is configured.
        await sleep(Math.min(latencyMs, 250));
      }

      const response = await withTimeout(
        fetch(`${config.openai.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.openai.apiKey}`,
          },
          body: JSON.stringify({
            model: config.openai.model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: [
                  `You are the ${label} inside MASTERY, a learning recovery system for Grade 8-9 mathematics.`,
                  "Return one JSON object only. Do not wrap it in markdown.",
                  "Follow the exact structure of the example object. Keep language concise, supportive and evidence-based.",
                  "Never label a learner permanently or claim certainty beyond the evidence.",
                  instructions,
                ].join("\n"),
              },
              {
                role: "user",
                content: `Input data:\n${JSON.stringify(payload, null, 2)}\n\nRequired JSON shape example:\n${JSON.stringify(fallback, null, 2)}`,
              },
            ],
          }),
        }),
        config.openai.timeoutMs,
        `${label} model call`,
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Provider returned ${response.status}: ${body.slice(0, 240)}`);
      }

      const body = await response.json();
      const content = body?.choices?.[0]?.message?.content;
      const parsed = extractJson(content);
      const validated = schema.parse(parsed);

      return {
        data: validated,
        meta: {
          provider: "openai",
          label: this.label,
          fallbackUsed: false,
          durationMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      console.warn(`[MASTERY] ${label}: AI call failed, using deterministic fallback. ${error.message}`);

      return {
        data: schema.parse(fallback),
        meta: {
          provider: "openai-fallback",
          label: `${this.label} · safe fallback`,
          fallbackUsed: true,
          error: error.message,
          durationMs: Date.now() - startedAt,
        },
      };
    }
  },
};
