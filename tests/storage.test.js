import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

test("a configured data directory persists across processes and rejects corrupted data", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mastery-store-test-"));
  const env = { ...process.env, AI_PROVIDER: "demo", MASTERY_DATA_DIR: directory };
  const run = (code) => spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
  });
  try {
    const write = run('const db = await import("./server/db/store.js"); await db.replaceLearner({ id: "persistent-test" });');
    assert.equal(write.status, 0, write.stderr);
    const read = run('const db = await import("./server/db/store.js"); if (!(await db.findLearner("persistent-test"))) process.exit(1);');
    assert.equal(read.status, 0, read.stderr);

    const dbFile = path.join(directory, "db.json");
    await writeFile(dbFile, "invalid json", "utf8");
    const corrupt = run('const db = await import("./server/db/store.js"); await db.getDb();');
    assert.notEqual(corrupt.status, 0);
    assert.match(corrupt.stderr, /Could not read local database/);
    assert.equal(await readFile(dbFile, "utf8"), "invalid json");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
