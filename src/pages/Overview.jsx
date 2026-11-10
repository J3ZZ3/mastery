import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { AGENTS, GAP_COPY, STATUS_META } from "../lib/constants.js";
import { percent, relativeTime } from "../lib/format.js";
import { Avatar, Badge, Button, Card, ProgressBar, SectionHeading, Spinner, StatCard } from "../components/ui.jsx";
import { cx } from "../lib/cx.js";

function AgentPipeline() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Agent hand-off</p>
        <Badge tone="mint" className="bg-mint-400/10 text-mint-200 ring-mint-300/30">
          6 agents
        </Badge>
      </div>
      <ol className="mt-3 space-y-2">
        {AGENTS.map((agent, index) => (
          <li key={agent.key} className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-mint-300">
              <agent.icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-100">{agent.short}</p>
            </div>
            {index < AGENTS.length - 1 ? (
              <ArrowRight className="h-3 w-3 shrink-0 text-slate-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-mint-400" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function LearnerCard({ learner, onOpen }) {
  const status = STATUS_META[learner.status] || STATUS_META.not_started;
  const delta =
    Number.isFinite(learner.latestScore) && Number.isFinite(learner.initialScore)
      ? learner.latestScore - learner.initialScore
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={learner.name} accent={learner.accent} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-950">{learner.name}</p>
            <p className="text-xs text-slate-500">
              Grade {learner.grade} · {learner.subject}
            </p>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-4 flex-1">
        <ProgressBar value={learner.progressPercent} label="Recovery progress" showValue />
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostic</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-800">
              {Number.isFinite(learner.initialScore) ? percent(learner.initialScore) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Mastery</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-800">
              {Number.isFinite(learner.latestScore) ? percent(learner.latestScore) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change</p>
            <p
              className={cx(
                "mt-0.5 text-sm font-bold tabular-nums",
                delta === null ? "text-slate-400" : delta >= 0 ? "text-mint-700" : "text-amber-700",
              )}
            >
              {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta} pts`}
            </p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">
          {learner.gap ? `Focus: ${GAP_COPY[learner.gap] || learner.gap}` : "No diagnostic submitted yet."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] font-medium text-slate-500">
          {learner.lastActivityAt ? `Active ${relativeTime(learner.lastActivityAt)}` : "Ready to start"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-mint-700 group-hover:text-mint-800">
          {learner.status === "not_started" ? "Begin" : "Open"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export default function Overview() {
  const { learners, selectedLearnerId, setSelectedLearnerId, loading, bootError, reload, health } = useApp();
  const navigate = useNavigate();

  const recovered = learners.filter((learner) => learner.status === "complete_pass").length;
  const support = learners.filter((learner) => ["complete_support", "retry", "error"].includes(learner.status)).length;
  const active = learners.filter((learner) =>
    ["diagnostic", "analyzing", "learning", "retry", "mastery"].includes(learner.status),
  ).length;

  const openLearner = (learnerId) => {
    setSelectedLearnerId(learnerId);
    navigate("/learner");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-6 w-6" />
          Loading the MASTERY workspace…
        </div>
      </div>
    );
  }

  if (bootError) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-xl font-bold">The workspace cannot reach the server</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{bootError}</p>
        <p className="mt-2 text-xs text-slate-500">
          Start the full app with <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run dev</code>.
        </p>
        <Button className="mt-5" onClick={reload}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 shadow-lift">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-mint-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-11">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-mint-200 ring-1 ring-inset ring-white/10">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI-powered learning recovery
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Every wrong answer is a clue.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              MASTERY coordinates six specialist agents to find the gap behind a learner&apos;s mistakes, design a
              targeted lesson, guide practice, and prove recovery with fresh questions — then give the teacher the
              evidence and the next step.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="mint" size="lg" icon={BookOpen} onClick={() => navigate("/learner")}>
                Enter learner workspace
              </Button>
              <Button
                variant="darkGhost"
                size="lg"
                icon={Users}
                className="border border-white/15"
                onClick={() => navigate("/teacher")}
              >
                Open teacher dashboard
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-mint-400" aria-hidden="true" />
                Evidence, not labels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                {health?.provider?.active === "openai" ? "AI provider connected" : "Runs fully offline"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                {health?.threshold ?? 80}% mastery threshold
              </span>
            </div>
          </div>

          <AgentPipeline />
        </div>
      </section>

      <section aria-label="Workspace summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Demo learners" value={learners.length} hint="Grade 9 Mathematics" icon={Users} tone="slate" />
        <StatCard label="Recovered" value={recovered} hint="Met the mastery threshold" icon={CheckCircle2} tone="mint" />
        <StatCard label="Needs support" value={support} hint="Teacher review recommended" icon={GraduationCap} tone="amber" />
        <StatCard label="Live cycles" value={active} hint="Currently in progress" icon={TrendingUp} tone="sky" />
      </section>

      <section>
        <SectionHeading
          eyebrow="Demo cohort"
          title="Three learners, three different stories"
          description="Switch between learners to see a fresh diagnostic, a successful recovery and a cycle that needs a teacher's judgement."
          action={
            <Badge tone="slate" icon={ClipboardList}>
              {learners.length} learners seeded
            </Badge>
          }
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {learners.map((learner) => (
            <LearnerCard
              key={learner.id}
              learner={learner}
              onOpen={() => openLearner(learner.id)}
            />
          ))}
        </div>
        {learners.length > 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            Currently selected:{" "}
            <span className="font-semibold text-slate-700">
              {learners.find((learner) => learner.id === selectedLearnerId)?.name || "none"}
            </span>
            . You can change learners inside the learner workspace.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: SearchCheck,
            title: "Diagnose the gap, not the score",
            body: "The Diagnostic Agent connects wrong answers to a prerequisite concept and states its confidence. A single slip is treated as a hypothesis until follow-up evidence arrives.",
          },
          {
            icon: BookOpen,
            title: "Teach the exact gap",
            body: "The Learning Designer builds a short intervention with a number line, worked examples and practice. If mastery is not met, the next attempt adapts the approach instead of repeating it.",
          },
          {
            icon: GraduationCap,
            title: "Hand the teacher the evidence",
            body: "The Teacher Insight Agent summarises the cycle, cites real scores, recommends an intervention and suggests the next classroom step. The teacher makes the final decision.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <span className="inline-flex rounded-xl bg-mint-50 p-2.5 text-mint-700 ring-1 ring-inset ring-mint-200">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-ink-950">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.body}</p>
          </Card>
        ))}
      </section>

      <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700 ring-1 ring-inset ring-amber-200">
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-950">Demo tip</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Thabo Mokoena&apos;s diagnostic answers are pre-filled and editable. Submit them, work through the lesson,
              and use the sample mastery answers to reach 80%. Reset the data any time from the sidebar.
            </p>
          </div>
        </div>
        <Link
          to="/activity"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-mint-700 transition hover:text-mint-800"
        >
          Watch agent activity
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}
