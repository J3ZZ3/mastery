import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  GraduationCap,
  Lightbulb,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";
import { GAP_COPY, skillLabel, STATUS_META } from "../lib/constants.js";
import { formatDateTime, lastAttempt, percent, relativeTime, signedPoints } from "../lib/format.js";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  ConfidenceMeter,
  EmptyState,
  ProgressBar,
  Spinner,
} from "../components/ui.jsx";
import DiagnosisCard from "../components/DiagnosisCard.jsx";
import { cx } from "../lib/cx.js";

function sessionStatusKey(session) {
  if (!session) return "not_started";
  if (session.status === "complete") {
    const attempt = lastAttempt(session);
    return attempt?.mastery?.result?.thresholdMet ? "complete_pass" : "complete_support";
  }
  return session.status;
}

function Metric({ label, value, hint, tone = "slate" }) {
  const tones = {
    mint: "text-mint-700",
    amber: "text-amber-700",
    sky: "text-sky-700",
    slate: "text-slate-800",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cx("mt-1 text-xl font-bold tabular-nums", tones[tone] || tones.slate)}>{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function EvidenceList({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-600">No item-level evidence was recorded for this session.</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.questionId} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-950">{item.prompt}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">{skillLabel(item.skill)}</p>
            </div>
            <Badge tone={item.correct ? "mint" : "amber"} icon={item.correct ? CheckCircle2 : XCircle}>
              {item.correct ? "Correct" : "Incorrect"}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
              Answered: <span className="font-bold">{item.learnerAnswer}</span>
            </span>
            {!item.correct ? (
              <span className="rounded-md bg-mint-50 px-2 py-1 font-medium text-mint-800 ring-1 ring-inset ring-mint-200">
                Expected: <span className="font-bold">{item.correctAnswer}</span>
              </span>
            ) : null}
          </div>
          {!item.correct && item.misconception ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{item.misconception}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AttemptCard({ attempt, isLatest }) {
  const practice = attempt.practice?.result;
  const mastery = attempt.mastery?.result;
  const passed = Boolean(mastery?.thresholdMet);

  return (
    <li className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
            {attempt.attempt}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-950">
              {attempt.intervention?.title || `Attempt ${attempt.attempt}`}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              {attempt.intervention?.objective}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {attempt.intervention?.adapted ? <Badge tone="amber">Adapted</Badge> : null}
          {isLatest ? <Badge tone="sky">Latest</Badge> : null}
          <Badge tone={passed ? "mint" : mastery ? "amber" : "slate"}>
            {mastery ? `${percent(mastery.scorePercent)} mastery` : "Pending"}
          </Badge>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-600">Tutor practice</span>
            <span className="font-semibold tabular-nums text-slate-800">
              {practice ? `${practice.correct}/${practice.total} · ${percent(practice.scorePercent)}` : "Pending"}
            </span>
          </div>
          <ProgressBar value={practice?.scorePercent ?? 0} tone="mint" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-600">Mastery check</span>
            <span className="font-semibold tabular-nums text-slate-800">
              {mastery ? `${mastery.correct}/${mastery.total} · ${percent(mastery.scorePercent)}` : "Pending"}
            </span>
          </div>
          <ProgressBar value={mastery?.scorePercent ?? 0} tone={passed ? "mint" : "amber"} />
        </div>
      </div>

      {practice?.feedbackSummary ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          <span className="font-semibold text-slate-700">Tutor feedback: </span>
          {practice.feedbackSummary}
        </p>
      ) : null}
    </li>
  );
}

function InsightPanel({ insight }) {
  if (!insight) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Teacher insight</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The Teacher Insight Agent runs after the final mastery check. This cycle is still in progress, so no summary
          has been generated yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-mint-200">
      <div className="border-b border-mint-100 bg-gradient-to-br from-mint-50 to-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-ink-950 p-2 text-mint-300">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mint-800">AI teacher insight</p>
              <h2 className="text-sm font-bold text-ink-950">Decision support, not a decision</h2>
            </div>
          </div>
          <Badge tone="mint">Final step</Badge>
        </div>
        <p className="mt-3 text-base font-bold leading-6 text-ink-950">{insight.headline}</p>
        <p className="mt-1.5 text-xs leading-5 text-slate-600">{insight.summary}</p>
        <div className="mt-3">
          <ConfidenceMeter value={insight.confidence} label="Confidence in the summary" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evidence cited</p>
          <ul className="mt-2 space-y-2">
            {insight.evidence.map((item, index) => (
              <li key={index} className="flex gap-2 text-xs leading-5 text-slate-600">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recommended approach</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{insight.recommendation}</p>
        </div>

        <div className="rounded-xl border border-mint-200 bg-mint-50 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-mint-800">
            <Target className="h-3 w-3" aria-hidden="true" />
            Next step
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-mint-900">{insight.nextStep}</p>
        </div>

        <p className="flex items-start gap-1.5 text-[10px] leading-4 text-slate-500">
          <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Generated from this cycle&apos;s recorded evidence. The teacher remains responsible for grouping, reteaching
          and any formal decision.
        </p>
      </div>
    </Card>
  );
}

export default function TeacherLearnerDetail() {
  const { learnerId } = useParams();
  const navigate = useNavigate();
  const { setSelectedLearnerId } = useApp();
  const [data, setData] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      try {
        const detail = await api.teacherLearner(learnerId);
        setData(detail);
        setError(null);
        setSelectedSessionId((current) =>
          current && detail.sessions.some((entry) => entry.session.id === current)
            ? current
            : detail.latestSessionId || detail.sessions[0]?.session.id || null,
        );
      } catch (loadError) {
        setError(loadError.message || "Could not load this learner.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [learnerId],
  );

  useEffect(() => {
    setLoading(true);
    setData(null);
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-6 w-6" />
          Loading the learner evidence…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold">This learner could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{error || "Learner not found."}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate("/teacher")}>
            Back to dashboard
          </Button>
          <Button icon={RefreshCw} onClick={() => load()}>
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  const { learner, sessions } = data;
  const selectedEntry = sessions.find((entry) => entry.session.id === selectedSessionId) || sessions[0];
  const session = selectedEntry?.session || null;

  if (!session) {
    return (
      <div className="space-y-5">
        <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>
        <EmptyState
          icon={ClipboardList}
          title={`${learner.name} has no learning cycle yet`}
          description="Start the diagnostic in the learner workspace. Once the agents have evidence, this profile will show the diagnosis, intervention, mastery result and teacher insight."
          action={
            <Button
              variant="mint"
              onClick={() => {
                setSelectedLearnerId(learner.id);
                navigate("/learner");
              }}
            >
              Open the learner workspace
            </Button>
          }
        />
      </div>
    );
  }

  const attempt = lastAttempt(session);
  const mastery = attempt?.mastery?.result;
  const practice = attempt?.practice?.result;
  const report = session.diagnostic?.report;
  const statusKey = sessionStatusKey(session);
  const status = STATUS_META[statusKey] || STATUS_META.not_started;
  const passed = Boolean(mastery?.thresholdMet);

  return (
    <div className="space-y-6">
      <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to cohort
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={learner.name} accent={learner.accent} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{learner.name}</h1>
              <Badge tone={status.tone}>{status.label}</Badge>
              {learner.isDemo ? <Badge tone="amber">Demo learner</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Grade {learner.grade} · {learner.subject} · {learner.topic}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Last activity {relativeTime(learner.lastActivityAt)} · {learner.completedCycles} completed cycle
              {learner.completedCycles === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => {
              setSelectedLearnerId(learner.id);
              navigate("/learner");
            }}
          >
            Learner view
          </Button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Initial diagnostic"
          value={report ? `${report.correctAnswers}/${report.totalQuestions} · ${percent(report.scorePercent)}` : "—"}
          hint={report ? `${report.identifiedPatterns.length} pattern${report.identifiedPatterns.length === 1 ? "" : "s"} identified` : "Not submitted"}
          tone="sky"
        />
        <Metric
          label="Tutor practice"
          value={practice ? `${practice.correct}/${practice.total} · ${percent(practice.scorePercent)}` : "—"}
          hint={practice ? "Final practice set" : "Not completed"}
          tone="mint"
        />
        <Metric
          label="Latest mastery"
          value={mastery ? `${mastery.correct}/${mastery.total} · ${percent(mastery.scorePercent)}` : "—"}
          hint={mastery ? `${passed ? "Threshold met" : "Below threshold"} · ${session.threshold}% required` : "Not submitted"}
          tone={passed ? "mint" : mastery ? "amber" : "slate"}
        />
        <Metric
          label="Attempts used"
          value={`${session.attempts.length} of 2`}
          hint={mastery?.comparison ? `${signedPoints(mastery.comparison.delta)} from diagnostic` : "Awaiting mastery"}
          tone="slate"
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Cycle progress</h2>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <div className="mt-3">
          <ProgressBar value={learner.progressPercent} label="Recovery progress" showValue />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sessions.map((entry) => {
            const entryStatus = STATUS_META[sessionStatusKey(entry.session)] || STATUS_META.not_started;
            const entryMastery = lastAttempt(entry.session)?.mastery?.result;
            return (
              <button
                key={entry.session.id}
                type="button"
                onClick={() => setSelectedSessionId(entry.session.id)}
                className={cx(
                  "rounded-xl border px-3 py-2 text-left transition",
                  entry.session.id === session.id
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  {formatDateTime(entry.session.createdAt)}
                  <span
                    className={cx(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      entry.session.id === session.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {entryStatus.label}
                  </span>
                </span>
                <span
                  className={cx(
                    "mt-0.5 block text-[10px]",
                    entry.session.id === session.id ? "text-slate-300" : "text-slate-500",
                  )}
                >
                  {entryMastery ? `${percent(entryMastery.scorePercent)} mastery · ${entry.session.attempts.length} attempt${entry.session.attempts.length === 1 ? "" : "s"}` : "In progress"}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {session.diagnosis ? <DiagnosisCard diagnosis={session.diagnosis} /> : null}

          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Diagnostic evidence</h2>
              </div>
              {report ? (
                <Badge tone="sky">{report.correctAnswers}/{report.totalQuestions} correct</Badge>
              ) : (
                <Badge tone="slate">Not submitted</Badge>
              )}
            </div>
            {report ? (
              <div className="mt-4">
                <EvidenceList items={report.items} />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                The diagnostic has not been submitted yet, so there is no item-level evidence.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Intervention and mastery path</h2>
            </div>
            {session.attempts.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">The Learning Designer has not produced an intervention yet.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {session.attempts.map((entry, index) => (
                  <AttemptCard
                    key={entry.attempt}
                    attempt={entry}
                    isLatest={index === session.attempts.length - 1}
                  />
                ))}
              </ol>
            )}
          </Card>

          {mastery ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Mastery comparison</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostic</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">{percent(mastery.comparison.initialScore)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Follow-up</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">{percent(mastery.comparison.latestScore)}</p>
                </div>
                <div className={cx("rounded-xl p-3", passed ? "bg-mint-50" : "bg-amber-50")}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change</p>
                  <p className={cx("mt-1 text-xl font-bold tabular-nums", passed ? "text-mint-700" : "text-amber-700")}>
                    {signedPoints(mastery.comparison.delta)}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-700">What remains difficult: </span>
                  {mastery.remainingDifficulty}
                </p>
                <p
                  className={cx(
                    "rounded-lg px-3 py-2 text-xs leading-5",
                    passed ? "bg-mint-50 text-mint-900" : "bg-amber-50 text-amber-900",
                  )}
                >
                  <span className="font-semibold">Mastery Agent recommendation: </span>
                  {mastery.recommendation}
                </p>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <InsightPanel insight={session.teacherInsight} />

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Session facts</h2>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Focus gap</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {session.diagnosis ? GAP_COPY[session.diagnosis.gapKey] || session.diagnosis.gapKey : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Started</dt>
                <dd className="text-right font-semibold text-slate-800">{formatDateTime(session.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Completed</dt>
                <dd className="text-right font-semibold text-slate-800">{formatDateTime(session.completedAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Mastery threshold</dt>
                <dd className="text-right font-semibold text-slate-800">{session.threshold}%</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Agent events</dt>
                <dd className="text-right font-semibold text-slate-800">{session.events.length}</dd>
              </div>
            </dl>
            <Link
              to="/activity"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:text-mint-800"
            >
              Open the full agent log
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Card>

          {!passed && session.status === "complete" ? (
            <Alert tone="warning" title="Teacher action recommended">
              The cycle is complete without meeting the mastery threshold. Use the evidence above to decide whether to
              reteach the related concept, regroup learners, or schedule a short paper check.
            </Alert>
          ) : null}

          {passed ? (
            <Alert tone="success" title="Recovery demonstrated">
              The learner met the mastery threshold on fresh questions. Keep a spaced review of signed arithmetic in an
              upcoming lesson.
            </Alert>
          ) : null}
        </div>
      </div>
    </div>
  );
}
