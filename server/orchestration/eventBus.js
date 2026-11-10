import { EventEmitter } from "node:events";

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

export function publishSessionEvent(sessionId, event) {
  emitter.emit(`session:${sessionId}`, event);
}

export function subscribeToSession(sessionId, handler) {
  const channel = `session:${sessionId}`;
  emitter.on(channel, handler);
  return () => emitter.off(channel, handler);
}
