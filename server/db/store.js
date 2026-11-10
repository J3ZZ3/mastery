import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nowIso } from "../lib/id.js";
import { buildSeedData } from "./seed.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "..", "data");
const dbFile = path.join(dataDir, "db.json");

let cache = null;
let writeQueue = Promise.resolve();

async function readDbFile() {
  try {
    const raw = await fs.readFile(dbFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.learners) || !Array.isArray(parsed.sessions)) {
      throw new Error("Database shape is invalid");
    }
    return parsed;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`[MASTERY] Could not read local database (${error.message}). Seeding a fresh one.`);
    }
    return null;
  }
}

async function writeDbFile(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2), "utf8");
}

async function ensureLoaded() {
  if (cache) return cache;

  const existing = await readDbFile();
  if (existing) {
    cache = existing;
    return cache;
  }

  cache = buildSeedData();
  await writeDbFile(cache);
  return cache;
}

export async function getDb() {
  return ensureLoaded();
}

export function updateDb(mutator) {
  const operation = writeQueue.then(async () => {
    const db = await ensureLoaded();
    const result = await mutator(db);
    db.meta.updatedAt = nowIso();
    await writeDbFile(db);
    return result;
  });

  writeQueue = operation.catch(() => {});
  return operation;
}

export async function findLearner(learnerId) {
  const db = await getDb();
  return db.learners.find((learner) => learner.id === learnerId) || null;
}

export async function listSessionsForLearner(learnerId) {
  const db = await getDb();
  return db.sessions
    .filter((session) => session.learnerId === learnerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function findSession(sessionId) {
  const db = await getDb();
  return db.sessions.find((session) => session.id === sessionId) || null;
}

export async function replaceSession(session) {
  return updateDb((db) => {
    const index = db.sessions.findIndex((item) => item.id === session.id);
    if (index >= 0) {
      db.sessions[index] = session;
    } else {
      db.sessions.push(session);
    }
    return session;
  });
}

export async function replaceLearner(learner) {
  return updateDb((db) => {
    const index = db.learners.findIndex((item) => item.id === learner.id);
    if (index >= 0) {
      db.learners[index] = learner;
    } else {
      db.learners.push(learner);
    }
    return learner;
  });
}

export async function resetDb() {
  const fresh = buildSeedData();
  fresh.meta.resetCount = 1;
  cache = fresh;
  await writeDbFile(fresh);
  return fresh;
}

export const dbPaths = { dataDir, dbFile };
