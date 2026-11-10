import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/index.js";
import { config } from "./config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "..", "dist");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", apiRouter);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found." });
  });

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({
        app: "MASTERY",
        message: "API is running. Start the Vite client with `npm run dev` or build with `npm run build`.",
      });
    });
  }

  app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    if (status >= 500) {
      console.error("[MASTERY] Unhandled server error:", error);
    }
    res.status(status).json({
      error: status >= 500 ? "Unexpected server error." : error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  });

  return app;
}
