import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";
import { AGENT_BY_KEY, GAP_COPY, STATUS_META } from "../lib/constants.js";
import { percent, relativeTime, signedPoints } from "../lib/format.js";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
  Spinner,
  StatCard,
} from "../components/ui.jsx";
import { cx } from "../lib/cx.js";

const SUPPORT_STATUSES = ["complete_support", "retry", "error"];

function LearnerRow({ learner }) {
  const status = STATUS_META[learner.status] || STATUS_META.not_started;
  const delta =
    Number.isFinite(learner.latestScore) && Number.isFinite(learner.initialScore)
      ? learner.latestScore - learner.initialScore
      : null;

  return (
    <Link
      to={`/teacher/learners/${learner.id}`}
      className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={learner.name} accent={learner.accent} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-ink-950">{learner.name}</p>
            <Badge tone={status.tone}>{status.label}</Badge>
            {learner.isDemo ? <Badge tone="amber">Demo</Badge> : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {learner.gap ? GAP_COPY[learner.gap] || learner.gap : "No diagnostic evidence yet"}
            {learner.attemptsUsed ? ` · ${learner.attemptsUsed} attempt${learner.attemptsUsed === 1 ? "" : "s"}` : ""}
          </p>
          <div className="mt-2 max-w-xs">
            <ProgressBar value={learner.progressPercent} />
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-3 text-xs sm:w-64">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostic</p>
          <p className="mt-0.5 font-bold tabular-nums text-slate-800">
            {Number.isFinite(learner.initialScore) ? percent(learner.initialScore) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Mastery</p>
          <p className="mt-0.5 font-bold tabular-nums text-slate-800">
            {Number.isFinite(learner.latestScore) ? percent(learner.latestScore) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change</p>
          <p
            className={cx(
              "mt-0.5 font-bold tabular-nums",
              delta === null ? "text-slate-400" : delta >= 0 ? "text-mint-700" : "text-amber-700",
            )}
          >
            {delta === null ? "—" : signedPoints(delta)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span className="text-[10px] text-slate-500 sm:hidden">{relativeTime(learner.lastActivityAt)}</span>
        <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>
    </Link>
  );
}

function ActivityRow({ event }) {
  const agent = AGENT_BY_KEY[event.agent];
  const Icon = agent?.icon || Activity;
  return (
    <li className="flex gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800">
          {event.learnerName} · <span className="font-medium text-slate-500">{agent?.short || event.agent}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-600">{event.summary || event.message}</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{relativeTime(event.at)}</p>
      </div>
    </li>
  );
}

export default function TeacherDashboard() {
  const { health } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const overview = await api.teacherOverview();
      setData(overview);
      setError(null);
    } catch (loadError) {
      setError(loadError.message || "Could not load the teacher overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-6 w-6" />
          Loading the teacher dashboard…
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold">The teacher dashboard is unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
        <Button className="mt-5" icon={RefreshCw} onClick={() => load()}>
          Try again
        </Button>
      </Card>
    );
  }

  const { stats, learners, recentEvents } = data;
  const supportLearners = learners.filter((learner) => SUPPORT_STATUSES.includes(learner.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Teaching workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Teacher dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Evidence from each agent cycle, summarised for a decision you still own. Open a learner to see the
            diagnostic evidence, the intervention, the mastery result and the recommended next step.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="slate" icon={ShieldCheck}>
            {data.threshold}% threshold
          </Badge>
          <Badge tone={health?.provider?.active === "openai" ? "mint" : "amber"}>
            {health?.provider?.active === "openai" ? "AI provider" : "Demo engine"}
          </Badge>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learners" value={stats.totalLearners} hint="In the demo cohort" icon={Users} tone="slate" />
        <StatCard
          label="Need support"
          value={stats.requiringSupport}
          hint="Teacher review recommended"
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Mastery recovery"
          value={`${stats.masteryRecovery}%`}
          hint={`${stats.completedCycles} completed cycle${stats.completedCycles === 1 ? "" : "s"}`}
          icon={TrendingUp}
          tone="mint"
        />
        <StatCard label="Active cycles" value={stats.activeCycles} hint="In progress right now" icon={Activity} tone="sky" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div>
              <p className="text-sm font-bold text-ink-950">Cohort</p>
              <p className="text-xs text-slate-500">Ordered by the most recent learning cycle.</p>
            </div>
            <Badge tone="slate">{learners.length} learners</Badge>
          </div>

          {learners.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Users}
                title="No learners yet"
                description="Seed or reset the demo data to restore the three fictional learners."
                action={<Button onClick={() => navigate("/learner")}>Open learner workspace</Button>}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {learners.map((learner) => (
                <LearnerRow key={learner.id} learner={learner} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[11px] text-slate-500 sm:px-5">
            <span>Only learners with a submitted diagnostic have evidence.</span>
            <Link to="/activity" className="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-800">
              Full agent log
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Priority review</h2>
            </div>
            {supportLearners.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                No learner currently needs an urgent review. Completed cycles still carry evidence for planning.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {supportLearners.map((learner) => {
                  const status = STATUS_META[learner.status];
                  return (
                    <li key={learner.id}>
                      <Link
                        to={`/teacher/learners/${learner.id}`}
                        className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 transition hover:bg-amber-50"
                      >
                        <Avatar name={learner.name} accent={learner.accent} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink-950">{learner.name}</p>
                          <p className="truncate text-[11px] text-amber-900">
                            {learner.gap ? GAP_COPY[learner.gap] || learner.gap : "Needs review"}
                          </p>
                        </div>
                        <Badge tone={status?.tone || "amber"}>{status?.label || "Review"}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-500">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              A diagnosis is a hypothesis. The teacher decides whether to reteach, regroup or move on.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Recent agent activity</h2>
              </div>
              <Link to="/activity" className="text-[11px] font-semibold text-mint-700 hover:text-mint-800">
                View all
              </Link>
            </div>
            {recentEvents.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No events yet. Start a learner cycle.</p>
            ) : (
              <ul className="mt-1 divide-y divide-slate-100">
                {recentEvents.slice(0, 8).map((event) => (
                  <ActivityRow key={`${event.sessionId}-${event.id}`} event={event} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <SectionHeading
        eyebrow="Decision support"
        title="What the teacher gets"
        description="A diagnosis with cited evidence, a record of the intervention and mastery check, a comparison against the initial diagnostic, and a concrete next step. Nothing is presented as a permanent label."
        action={
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/learner")}>
            See the learner view
          </Button>
        }
      />

      {error ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}{" "}
          <button type="button" className="font-semibold underline" onClick={() => load(true)}>
            Try again
          </button>
        </Card>
      ) : null}
    </div>
  );
}
