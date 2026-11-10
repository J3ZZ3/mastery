import { useEffect, useState } from "react";
import { api } from "./api.js";

/**
 * Combines live SSE with persisted session snapshots in case the stream is
 * buffered or disconnected by a proxy.
 */
export function useAgentStream(sessionId, initialEvents = []) {
  const [events, setEvents] = useState(initialEvents);
  const initialLength = initialEvents.length;

  useEffect(() => {
    setEvents(initialEvents);
    if (!sessionId) return undefined;

    let active = true;
    let pollInFlight = false;
    let pollFailed = false;
    const mergeEvents = (incoming) => {
      setEvents((current) => {
        const byId = new Map(current.map((event) => [event.id, event]));
        for (const event of incoming) byId.set(event.id, event);
        return [...byId.values()].sort((a, b) => new Date(a.at) - new Date(b.at));
      });
    };
    const poll = async () => {
      if (pollInFlight) return;
      pollInFlight = true;
      try {
        const { session } = await api.session(sessionId);
        if (active) mergeEvents(session.events);
        pollFailed = false;
      } catch (error) {
        if (active && !pollFailed) console.error("Could not refresh agent activity:", error);
        pollFailed = true;
      } finally {
        pollInFlight = false;
      }
    };
    const timer = setInterval(poll, 3000);
    const source = typeof EventSource === "undefined"
      ? null
      : new EventSource(`/api/learning-sessions/${sessionId}/events`);

    const onSnapshot = (event) => {
      try {
        const payload = JSON.parse(event.data);
        mergeEvents(payload.events || []);
      } catch (error) {
        console.error("Could not parse agent activity snapshot:", error);
      }
    };

    const onAgentEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEvents((current) =>
          current.some((item) => item.id === payload.id)
            ? current
            : [...current, payload].sort((a, b) => new Date(a.at) - new Date(b.at)),
        );
      } catch (error) {
        console.error("Could not parse agent activity event:", error);
      }
    };

    source?.addEventListener("snapshot", onSnapshot);
    source?.addEventListener("agent-event", onAgentEvent);

    return () => {
      active = false;
      clearInterval(timer);
      source?.removeEventListener("snapshot", onSnapshot);
      source?.removeEventListener("agent-event", onAgentEvent);
      source?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, initialLength]);

  return events;
}
