import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";
import { AGENTS, AGENT_BY_KEY, AGENT_STATUS_META } from "../lib/constants.js";
import { formatDateTime, relativeTime } from "../lib/format.js";
import { Badge, Button, Card, EmptyState, SectionHeading, Spinner, StatCard } from "../components/ui.jsx";
import { cx } from "../lib/cx.js";

function EventRow({ event }) {
  const agent = AGENT_BY_KEY[event.agent] || {
    name: event.agent,
    icon: Activity,
  };
  const status = AGENT_STATUS_META[event.status] || AGENT_STATUS_META.progress;
  const Icon = agent.icon;

  return (
    <li className="relative flex gap-3 px-4 py-4 sm:px-5">
      <span
        className={cx(
          "relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
          event.status === "completed"
            ? "bg-mint-50 text-mint-700 ring-mint-200"
            : event.status === "failed"
              ? "bg-rose-50 text-rose-700 ring-rose-200"
              : "bg-sky-50 text-sky-700 ring-sky-200",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-ink-950">{agent.name}</p>
          <Badge tone={status.tone}>{status.label}</Badge>
          {event.attempt ? <span className="text-[10px] font-medium text-slate-500">Attempt {event.attempt}</span> : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{event.message}</p>
        {event.summary ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{event.summary}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
          <span className="font-semibold text-slate-600">{event.learnerName}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {formatDateTime(event.at)}
          </span>
          {event.durationMs ? <span>{Math.round(event.durationMs)} ms</span> : null}
          {event.provider ? <span>Provider: {event.provider}</span> : null}
        </div>
      </div>
    </li>
  );
}

export default function AgentActivity() {
  const { learners, health } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [learnerFilter, setLearnerFilter] = useState("all");

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const data = await api.activity(200);
      setEvents(data.events || []);
      setError(null);
    } catch (loadError) {
      setError(loadError.message || "Could not load the activity feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 8000);
    return () => clearInterval(timer);
  }, [load]);

  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          (agentFilter === "all" || event.agent === agentFilter) &&
          (learnerFilter === "all" || event.learnerId === learnerFilter),
      ),
    [events, agentFilter, learnerFilter],
  );

  const completed = events.filter((event) => event.status === "completed").length;
  const failed = events.filter((event) => event.status === "failed").length;
  const activeLearners = new Set(events.map((event) => event.learnerId)).size;

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-6 w-6" />
          Loading the orchestration log…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Orchestration log</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Agent activity</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Every entry is written by the orchestrator when an agent actually starts, completes or fails. This is the
            same event stream that drives the learner&apos;s live panel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="mint" icon={Activity}>
            Live feed
          </Badge>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recorded events" value={events.length} hint="Across all demo cycles" icon={Activity} tone="sky" />
        <StatCard label="Completed steps" value={completed} hint="Validated agent results" icon={CheckCircle2} tone="mint" />
        <StatCard label="Failed steps" value={failed} hint="Fallbacks or validation failures" icon={XCircle} tone={failed ? "rose" : "slate"} />
        <StatCard label="Learners seen" value={activeLearners} hint={`Provider: ${health?.provider?.label || "checking"}`} icon={Users} tone="amber" />
      </div>

      {error ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}{" "}
          <button type="button" className="font-semibold underline" onClick={() => load(true)}>
            Try again
          </button>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink-950">Event stream</p>
              <p className="text-xs text-slate-500">
                {filtered.length} of {events.length} events · newest first
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Learner</span>
                <select
                  value={learnerFilter}
                  onChange={(event) => setLearnerFilter(event.target.value)}
                  className="max-w-[9rem] bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  aria-label="Filter by learner"
                >
                  <option value="all">All learners</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by agent">
            <button
              type="button"
              onClick={() => setAgentFilter("all")}
              className={cx(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                agentFilter === "all"
                  ? "border-ink-950 bg-ink-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              All agents
            </button>
            {AGENTS.map((agent) => (
              <button
                key={agent.key}
                type="button"
                onClick={() => setAgentFilter(agent.key)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  agentFilter === agent.key
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                <agent.icon className="h-3 w-3" aria-hidden="true" />
                {agent.short}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Activity}
              title="No events match this filter"
              description="Choose a different agent or learner. New events appear here within a few seconds."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setAgentFilter("all");
                    setLearnerFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="relative divide-y divide-slate-100">
            {filtered.map((event) => (
              <EventRow key={`${event.sessionId}-${event.id}`} event={event} />
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[11px] text-slate-500">
          <span>Auto-refreshes every 8 seconds. Last event {relativeTime(events[0]?.at)}.</span>
          <span>{health?.provider?.active === "openai" ? "AI provider active" : "Deterministic demo engine"}</span>
        </div>
      </Card>

      <SectionHeading
        eyebrow="Demo note"
        title="This log is evidence of real orchestration"
        description="The timeline is not a scripted animation. Each step was produced by the server while processing the submitted answers, and each completed step carries the provider that returned the validated result."
      />
    </div>
  );
}
