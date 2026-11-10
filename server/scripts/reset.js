import { resetDb, dbPaths } from "../db/store.js";

const db = await resetDb();
console.log(`[MASTERY] Demo data reset at ${dbPaths.dbFile}`);
console.log(`  Learners: ${db.learners.length}`);
console.log(`  Sessions: ${db.sessions.length}`);
