import { randomUUID } from "node:crypto";

export const newId = (prefix) => `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 10)}`;

export const nowIso = () => new Date().toISOString();

export const addMs = (iso, ms) => new Date(new Date(iso).getTime() + ms).toISOString();
