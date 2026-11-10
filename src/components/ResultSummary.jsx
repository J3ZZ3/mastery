import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge, Button, Card, ProgressBar } from "./ui.jsx";
import { cx } from "../lib/cx.js";
import { formatDateTime, percent, signedPoints } from "../lib/format.js";

function AttemptRow({ attempt }) {
  const mastery = attempt.mastery?.result;
  const practice = attempt.practice?.result;
  const passed = Boolean(mastery?.thresholdMet);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
            passed ? "bg-mint-100 text-mint-800" : "bg-amber-100 text-amber-900",
          )}
          aria-hidden="true"
        >
          {attempt.attempt}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-950">
            Attempt {attempt.attempt}
            <span className="ml-2 font-normal text-slate-500">{attempt.intervention?.title}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Practice {practice?.correct ?? 0}/{practice?.total ?? 0} · Mastery {mastery?.correct ?? 0}/
            {mastery?.total ?? 0}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {attempt.intervention?.adapted ? <Badge tone="amber">Adapted</Badge> : null}
        <Badge tone={passed ? "mint" : "amber"} icon={passed ? CheckCircle2 : Target}>
          {percent(mastery?.scorePercent)} · {passed ? "threshold met" : "not yet"}
        </Badge>
      </div>
    </li>
  );
}

export default function ResultSummary({ session, onRestart, restarting = false, restartLabel = "Start a new recovery cycle" }) {
  if (!session) return null;

  const attempts = session.attempts || [];
  const finalAttempt = attempts[attempts.length - 1];
  const mastery = finalAttempt?.mastery?.result;
  const report = session.diagnostic?.report;
  const passed = Boolean(mastery?.thresholdMet);
  const initial = mastery?.comparison?.initialScore ?? report?.scorePercent ?? 0;
  const latest = mastery?.scorePercent ?? 0;
  const delta = mastery?.comparison?.delta ?? latest - initial;

  return (
    <div className="space-y-5">
      <Card
        className={cx(
          "overflow-hidden border-0 text-white shadow-lift",
          passed ? "bg-gradient-to-br from-ink-950 via-ink-900 to-mint-800" : "bg-gradient-to-br from-ink-950 via-ink-900 to-amber-800",
        )}
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <span
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
                  passed ? "bg-mint-400/15 text-mint-200 ring-1 ring-inset ring-mint-300/30" : "bg-amber-400/15 text-amber-200 ring-1 ring-inset ring-amber-300/30",
                )}
              >
                {passed ? <Award className="h-3.5 w-3.5" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
                Recovery cycle complete
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                {passed ? "You closed the gap." : "You have evidence for a teacher check-in."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {passed
                  ? `You moved from ${percent(initial)} on the first diagnostic to ${percent(latest)} on a fresh mastery check. That is a real change in understanding, not just a better guess on the same questions.`
                  : `Your latest mastery check reached ${percent(latest)} against the ${session.threshold}% threshold. The cycle is complete, and your teacher now has the evidence and a recommended next step.`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Latest mastery</p>
              <p className="mt-1 text-4xl font-black tabular-nums text-white">{percent(latest)}</p>
              <p className={cx("mt-1 text-xs font-semibold", delta >= 0 ? "text-mint-300" : "text-amber-300")}>
                {signedPoints(delta)} from the diagnostic
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Initial diagnostic</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-white">
                {report?.correctAnswers ?? 0}/{report?.totalQuestions ?? 0} · {percent(initial)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Attempts used</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-white">
                {attempts.length} of 2
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Completed</p>
              <p className="mt-1 text-sm font-bold text-white">{formatDateTime(session.completedAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Score journey</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Initial diagnostic</span>
                <span className="font-semibold tabular-nums text-slate-800">{percent(initial)}</span>
              </div>
              <ProgressBar value={initial} tone="sky" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Latest mastery check</span>
                <span className="font-semibold tabular-nums text-slate-800">{percent(latest)}</span>
              </div>
              <ProgressBar value={latest} tone={passed ? "mint" : "amber"} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
              <span className="font-medium text-slate-600">Mastery threshold</span>
              <span className="font-semibold text-slate-800">{session.threshold}%</span>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attempt history</p>
            <ol className="mt-3 space-y-2">
              {attempts.map((attempt) => (
                <AttemptRow key={attempt.attempt} attempt={attempt} />
              ))}
            </ol>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-mint-600" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Your next step</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {mastery?.recommendation || "Keep practising the same skill with a short spaced review."}
            </p>
            {finalAttempt?.intervention?.recap ? (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <span className="font-semibold text-slate-700">Carry this forward: </span>
                {finalAttempt.intervention.recap}
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Explore the evidence</p>
            <div className="mt-3 space-y-2">
              <Link
                to="/activity"
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Agent activity
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              </Link>
              <Link
                to="/teacher"
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Teacher dashboard
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {onRestart ? (
            <Button variant="mint" className="w-full" icon={RotateCcw} onClick={onRestart} loading={restarting}>
              {restartLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
