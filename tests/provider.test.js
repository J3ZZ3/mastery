import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { z } from "zod";

let behavior = "valid";
let received;
const server = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  received = { url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) };
  if (behavior === "timeout") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write('{"choices":');
    setTimeout(() => res.end("[]}"), 300);
    return;
  }
  if (behavior === "http-error") {
    res.writeHead(401);
    res.end("sensitive provider response");
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    choices: [{ message: { content: behavior === "invalid" ? "not JSON" : '{"message":"from model"}' } }],
  }));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
process.env.OPENAI_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;
process.env.OPENAI_API_KEY = "local-test-key";
process.env.OPENAI_MODEL = "local-test-model";
process.env.OPENAI_TIMEOUT_MS = "100";
const { openaiProvider } = await import("../server/providers/openaiProvider.js");
const args = {
  schema: z.object({ message: z.string() }),
  fallback: { message: "deterministic" },
  instructions: "Return the test message.",
  payload: { input: "test" },
  label: "Test Agent",
};

test.after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test("OpenAI provider sends a server-side request and returns validated model output", async () => {
  behavior = "valid";
  const result = await openaiProvider.generateJSON(args);
  assert.equal(result.data.message, "from model");
  assert.equal(result.meta.provider, "openai");
  assert.equal(received.url, "/v1/chat/completions");
  assert.equal(received.authorization, "Bearer local-test-key");
  assert.equal(received.body.model, "local-test-model");
});

test("OpenAI provider uses the fallback for invalid responses and redacts HTTP response bodies", async () => {
  behavior = "invalid";
  let result = await openaiProvider.generateJSON(args);
  assert.equal(result.data.message, "deterministic");
  assert.equal(result.meta.provider, "openai-fallback");
  behavior = "http-error";
  result = await openaiProvider.generateJSON(args);
  assert.equal(result.meta.error, "Provider returned HTTP 401");
});

test("OpenAI timeout also applies while reading the response body", async () => {
  behavior = "timeout";
  const result = await openaiProvider.generateJSON(args);
  assert.equal(result.meta.provider, "openai-fallback");
  assert.equal(result.meta.error, "Provider request timed out.");
});
