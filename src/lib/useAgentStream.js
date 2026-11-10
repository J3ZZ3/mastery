import { useEffect, useState } from "react";

/**
 * Subscribes to the session SSE stream. The initial snapshot is replaced by
 * live orchestrator events, so the panel never invents agent progress.
 */
export function useAgentStream(sessionId, initialEvents = []) {
  const [events, setEvents] = useState(initialEvents);
  const initialLength = initialEvents.length;

  useEffect(() => {
    setEvents(initialEvents);
    if (!sessionId) return undefined;

    const source = new EventSource(`/api/learning-sessions/${sessionId}/events`);

    const onSnapshot = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEvents(payload.events || []);
      } catch {
        // Keep the last known events if a malformed frame arrives.
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
      } catch {
        // A malformed event should not break the live panel.
      }
    };

    source.addEventListener("snapshot", onSnapshot);
    source.addEventListener("agent-event", onAgentEvent);

    return () => {
      source.removeEventListener("snapshot", onSnapshot);
      source.removeEventListener("agent-event", onAgentEvent);
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, initialLength]);

  return events;
}
