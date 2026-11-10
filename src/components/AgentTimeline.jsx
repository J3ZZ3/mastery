import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { AGENTS, AGENT_STATE_META } from "../lib/constants.js";
import { cx } from "../lib/cx.js";
import { Badge, ProgressBar } from "./ui.jsx";

function buildStates(events, session) {
  const currentAttempt = session?.attempt || 1;
  const markNext = Boolean(
    session && ["analyzing", "learning", "retry", "mastery"].includes(session.status),
  );

  return AGENTS.map((agent) => {
    const fixedAttempt = ["assessment", "diagnostic"].includes(agent.key) ? 1 : currentAttempt;
    const relevant = events.filter(
      (event) => event.agent === agent.key && (event.attempt || 1) === fixedAttempt,
    );
    const latest = relevant[relevant.length - 1] || null;

    let state = "waiting";
    if (latest) {
      if (latest.status === "completed") state = "complete";
      else if (latest.status === "failed") state = "failed";
      else state = "active";
    }

    return { ...agent, state, latest, relevant };
  }).map((agent, index, all) => {
    if (!markNext || agent.state !== "waiting") return agent;
    const alreadySelected = all.slice(0, index).some((item) => item.state === "next");
    const hasActive = all.some((item) => item.state === "active");
    if (alreadySelected || hasActive) return agent;
    return { ...agent, state: "next" };
  });
}

function StateIcon({ state }) {
  if (state === "complete") return <CheckCircle2 className="h-4 w-4 text-mint-600" aria-hidden="true" />;
  if (state === "failed") return <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />;
  if (state === "active") return <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />;
  if (state === "next") return <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />;
  return <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />;
}

export default function AgentTimeline({ events = [], session, compact = false, className = "" }) {
  const states = buildStates(events, session);
  const completed = states.filter((agent) => agent.state === "complete").length;

  return (
    <section
      className={cx("rounded-2xl border border-slate-200 bg-white shadow-soft", compact ? "p-4" : "p-5", className)}
      aria-label="Agent workflow activity"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Agent activity</p>
          <h3 className="mt-1 text-sm font-bold text-ink-950">Six agents, one workflow</h3>
        </div>
        <Badge tone={completed === 6 ? "mint" : "slate"}>
          {completed}/{states.length} complete
        </Badge>
      </div>

      <ProgressBar value={(completed / states.length) * 100} className="mt-4" label="Workflow progress" showValue />

      <ol className="mt-5 space-y-0">
        {states.map((agent, index) => {
          const meta = AGENT_STATE_META[agent.state];
          const summary =
            agent.latest?.summary ||
            agent.latest?.message ||
            (agent.state === "next" ? "Ready for the next hand-off." : agent.description);

          return (
            <li key={agent.key} className="relative flex gap-3 pb-5 last:pb-0">
              {index < states.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute left-[15px] top-8 h-[calc(100%-28px)] w-px",
                    agent.state === "complete" ? "bg-mint-200" : "bg-slate-200",
                  )}
                />
              ) : null}
              <span
                className={cx(
                  "relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                  agent.state === "complete"
                    ? "bg-mint-50 text-mint-700 ring-mint-200"
                    : agent.state === "active"
                      ? "bg-sky-50 text-sky-700 ring-sky-200"
                      : agent.state === "failed"
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : agent.state === "next"
                          ? "bg-sky-50 text-sky-700 ring-sky-200"
                          : "bg-white text-slate-400 ring-slate-200",
                )}
              >
                <agent.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className={cx("text-sm font-semibold", agent.state === "waiting" ? "text-slate-500" : "text-ink-950")}>
                    {agent.name}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <StateIcon state={agent.state} />
                    {meta.label}
                  </span>
                </div>
                <p className={cx("mt-1 text-xs leading-5", agent.state === "waiting" ? "text-slate-400" : "text-slate-600")}>
                  {summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-500">
        Driven by live orchestrator events. A step only shows completed after the agent has returned a validated result.
      </p>
    </section>
  );
}
