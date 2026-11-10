import { sleep } from "../lib/async.js";

/**
 * Deterministic local provider used for the hackathon demo.
 * It does not call a model. Agent modules supply a fully-computed
 * fallback payload, which this provider validates and returns after a
 * small, configurable latency so the workflow feels like real work.
 */
export const demoProvider = {
  id: "demo",
  label: "Deterministic demo engine",

  async generateJSON({ schema, fallback, latencyMs = 0 }) {
    if (latencyMs > 0) {
      await sleep(latencyMs);
    }

    const data = schema.parse(fallback);
    return {
      data,
      meta: {
        provider: "demo",
        label: "Deterministic demo engine",
        fallbackUsed: true,
      },
    };
  },
};
