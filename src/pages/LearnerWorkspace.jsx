import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Lightbulb,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { AGENTS, GAP_COPY, STATUS_META } from "../lib/constants.js";
import { lastAttempt, percent } from "../lib/format.js";
import { useAgentStream } from "../lib/useAgentStream.js";
import AgentTimeline from "../components/AgentTimeline.jsx";
import DiagnosisCard from "../components/DiagnosisCard.jsx";
import LessonPanel from "../components/LessonPanel.jsx";
import PracticePanel from "../components/PracticePanel.jsx";
import Questionnaire from "../components/Questionnaire.jsx";
import ResultSummary from "../components/ResultSummary.jsx";
import WorkflowStepper from "../components/WorkflowStepper.jsx";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  ProgressBar,
  Spinner,
} from "../components/ui.jsx";
import { cx } from "../lib/cx.js";

const IN_PROGRESS = ["diagnostic", "analyzing", "learning", "retry", "mastery"];

function AnalysisCard({ session, onRefresh, busy }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 to-white p-6">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Spinner className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Agents at work</p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">Your agents are analysing the evidence</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-600">
              The Assessment Agent is scoring each item, then the Diagnostic Agent will form a hypothesis and the
              Learning Designer will build the intervention. Each result is validated before the next agent receives it.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ol className="space-y-3">
          {AGENTS.slice(0, 3).map((agent, index) => (
            <li key={agent.key} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-950">{agent.name}</p>
                <p className="text-xs text-slate-500">{agent.description}</p>
              </div>
              <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500 animate-pulse-ring" aria-hidden="true" />
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Keep this page open. You can also refresh if the connection drops.
          </p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRefresh} loading={busy}>
            Refresh status
          </Button>
        </div>
        {session?.status === "error" ? (
          <Alert tone="error" title="A step could not finish" className="mt-4">
            {session.error || "Refresh the session or start the cycle again."}
          </Alert>
        ) : null}
      </div>
    </Card>
  );
}

function StartCard({ learner, onStart, busy }) {
  const firstName = (learner?.name || "there").split(" ")[0];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-mint-50 via-white to-sky-50 p-6 sm:p-8">
        <Badge tone="mint" icon={Sparkles}>
          Ready when you are
        </Badge>
        <h2 className="mt-3 max-w-xl text-2xl font-bold sm:text-3xl">
          Hi {firstName}. Let&apos;s find the gap behind the mistakes.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Five short questions on integers and a simple equation. There is no timer and no penalty for a wrong answer —
          the diagnostic is only there to help the agents choose what to teach next.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="mint" size="lg" icon={Play} onClick={onStart} loading={busy}>
            Start the diagnostic
          </Button>
          <span className="text-xs text-slate-500">About 2 minutes · {learner?.isDemo ? "demo answers pre-filled" : "no sign-in required"}</span>
        </div>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        {[
          {
            icon: ClipboardList,
            title: "1. Show what you know",
            body: "Answer five diagnostic questions. Every response is evidence, not a grade.",
          },
          {
            icon: BookOpen,
            title: "2. Learn the exact gap",
            body: "A personalised lesson and guided practice target the prerequisite skill behind the errors.",
          },
          {
            icon: Target,
            title: "3. Prove the recovery",
            body: "Fresh mastery questions check whether the understanding transferred, with a second attempt if needed.",
          },
        ].map((step) => (
          <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="inline-flex rounded-lg bg-slate-100 p-2 text-slate-600">
              <step.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-ink-950">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{step.body}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function LearnerWorkspace() {
  const {
    learners,
    selectedLearner,
    selectedLearnerId,
    setSelectedLearnerId,
    refreshLearners,
    notify,
    loading: appLoading,
  } = useApp();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState({});
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [masteryAnswers, setMasteryAnswers] = useState({});
  const [view, setView] = useState("lesson");

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.learnerProgress(selectedLearnerId);
        setProgress(data);
        setError(null);
      } catch (loadError) {
        setError(loadError.message || "Could not load this learner.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedLearnerId],
  );

  useEffect(() => {
    setLoading(true);
    setProgress(null);
    setDiagnosticAnswers({});
    setPracticeAnswers({});
    setMasteryAnswers({});
    load();
  }, [load]);

  const session = progress?.currentSession || null;
  const learner = selectedLearner || progress?.learner;
  const liveEvents = useAgentStream(session?.id, session?.events || []);

  useEffect(() => {
    if (session?.status !== "analyzing" || busy) return undefined;
    const timer = setInterval(() => load(true), 3000);
    return () => clearInterval(timer);
  }, [session?.id, session?.status, busy, load]);

  const applySession = useCallback(
    (nextSession) => {
      setProgress((current) =>
        current
          ? {
              ...current,
              currentSession: nextSession,
              activeSession: IN_PROGRESS.includes(nextSession.status) ? nextSession : null,
            }
          : current,
      );
      refreshLearners().catch(() => {});
    },
    [refreshLearners],
  );

  useEffect(() => {
    const current = progress?.currentSession;
    if (!current) return;

    setView("lesson");

    if (current.status === "diagnostic") {
      const prefill = { ...(current.diagnostic.answers || {}) };
      for (const question of current.diagnostic.questions) {
        if (question.demoAnswer && !prefill[question.id]) prefill[question.id] = question.demoAnswer;
      }
      setDiagnosticAnswers(prefill);
      setMasteryAnswers({});
      setPracticeAnswers({});
      return;
    }

    if (current.status === "learning" || current.status === "retry") {
      const attempt = lastAttempt(current);
      const prefill = { ...(attempt?.practice?.answers || {}) };
      for (const question of attempt?.intervention?.practiceQuestions || []) {
        if (question.demoAnswer && !prefill[question.id]) prefill[question.id] = question.demoAnswer;
      }
      setPracticeAnswers(prefill);
      setMasteryAnswers({});
      return;
    }

    if (current.status === "mastery") {
      const attempt = lastAttempt(current);
      const prefill = { ...(attempt?.mastery?.answers || {}) };
      for (const question of attempt?.mastery?.questions || []) {
        if (question.demoAnswer && !prefill[question.id]) prefill[question.id] = question.demoAnswer;
      }
      setMasteryAnswers(prefill);
    }
  }, [progress?.currentSession?.id, progress?.currentSession?.status, progress?.currentSession?.attempt]);

  const startSession = async (restart = false) => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.createSession({ learnerId: selectedLearnerId, restart });
      applySession(data.session);
      if (data.learner) {
        setProgress((current) => (current ? { ...current, learner: data.learner } : current));
      }
      notify(
        data.resumed
          ? "Resumed the saved learning cycle."
          : "Diagnostic ready. Answer all five questions, then submit.",
        "success",
      );
    } catch (startError) {
      setError(startError.message || "Could not start the cycle.");
      notify(startError.message || "Could not start the cycle.", "error");
    } finally {
      setBusy(false);
    }
  };

  const submitDiagnostic = async (answers) => {
    setBusy(true);
    try {
      const data = await api.submitDiagnostic(session.id, answers);
      applySession(data.session);
      notify("Diagnosis ready and a personalised lesson has been designed.", "success");
    } catch (submitError) {
      notify(submitError.message || "Could not analyse the diagnostic.", "error");
    } finally {
      setBusy(false);
    }
  };

  const checkPractice = async (questionId, answer) => {
    try {
      const data = await api.checkPractice(session.id, questionId, answer);
      return data.check;
    } catch (checkError) {
      notify(checkError.message || "Could not check that answer.", "error");
      return {
        correct: false,
        feedback: "The tutor could not check that answer.",
        hint: checkError.message || "Try again in a moment.",
      };
    }
  };

  const finishPractice = async (answers) => {
    setBusy(true);
    try {
      const data = await api.submitPractice(session.id, answers);
      applySession(data.session);
      notify("Practice reviewed. Your mastery check is ready — new questions, same skill.", "success");
    } catch (submitError) {
      notify(submitError.message || "Could not complete the practice set.", "error");
    } finally {
      setBusy(false);
    }
  };

  const submitMastery = async (answers) => {
    setBusy(true);
    try {
      const data = await api.submitMastery(session.id, answers);
      applySession(data.session);
      if (data.session.status === "complete") {
        notify("Recovery cycle complete. Your teacher insight is ready.", "success");
      } else if (data.session.status === "retry") {
        notify("The mastery threshold was not met, so the intervention has been adapted.", "info");
      }
    } catch (submitError) {
      notify(submitError.message || "Could not evaluate the mastery check.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (appLoading || (loading && !progress)) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-6 w-6" />
          Loading the learner workspace…
        </div>
      </div>
    );
  }

  if (error && !progress) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold">This learner could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
        <Button className="mt-5" icon={RefreshCw} onClick={() => load()}>
          Try again
        </Button>
      </Card>
    );
  }

  const statusKey =
    (session?.status === "complete"
      ? lastAttempt(session)?.mastery?.result?.thresholdMet
        ? "complete_pass"
        : "complete_support"
      : session?.status) ||
    learner?.status ||
    "not_started";
  const status = STATUS_META[statusKey] || STATUS_META.not_started;
  const attempt = lastAttempt(session);
  const firstName = (learner?.name || "Learner").split(" ")[0];

  const renderStage = () => {
    if (!session) {
      return <StartCard learner={learner} onStart={() => startSession(false)} busy={busy} />;
    }

    if (busy && session.status === "diagnostic") {
      return <AnalysisCard session={session} onRefresh={() => load(true)} busy={busy} />;
    }

    if (session.status === "analyzing") {
      return <AnalysisCard session={session} onRefresh={() => load(true)} busy={loading} />;
    }

    if (session.status === "diagnostic") {
      return (
        <div className="space-y-4">
          <Alert tone="info" title="Diagnostic · five questions">
            Answer every question before submitting. The agents evaluate the answers as submitted — including the
            pre-filled demo answers, which you can change at any time.
          </Alert>
          <Questionnaire
            key={`${session.id}-diagnostic`}
            eyebrow="Diagnostic · Assessment Agent"
            title="Let's find the pattern"
            description="No timer and no grade. A wrong answer is useful evidence, and a single slip will be treated as a hypothesis rather than a verdict."
            icon={ClipboardList}
            questions={session.diagnostic.questions}
            answers={diagnosticAnswers}
            onAnswersChange={setDiagnosticAnswers}
            onSubmit={submitDiagnostic}
            submitLabel="Analyse my answers"
            busy={busy}
            demoNote={
              session.isDemo
                ? "Thabo's sample answers are pre-filled so the demo runs quickly. Change any option to explore a different diagnosis."
                : undefined
            }
            meta={<Badge tone="slate">{session.diagnostic.questions.length} questions</Badge>}
            footerNote="Submitting runs the Assessment, Diagnostic and Learning Designer agents in sequence."
          />
        </div>
      );
    }

    if (session.status === "learning" || session.status === "retry") {
      if (!attempt?.intervention) {
        return (
          <Alert tone="warning" title="The intervention is not available">
            The lesson content could not be loaded. Refresh the session or start again.
          </Alert>
        );
      }

      const practiceResult = attempt.practice?.result;

      return (
        <div className="space-y-4">
          {session.status === "retry" ? (
            <Alert tone="warning" title="The mastery threshold was not met yet">
              The first check reached {percent(session.attempts[0]?.mastery?.result?.scorePercent)}. This is an adapted
              attempt: the explanation is slower, the sign decision is separated from the calculation, and the practice
              questions are fresh.
            </Alert>
          ) : null}

          <DiagnosisCard diagnosis={session.diagnosis} />

          {practiceResult ? (
            <Alert tone={practiceResult.needsReteach ? "warning" : "success"} title="Tutor feedback">
              {practiceResult.feedbackSummary}
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
            <div className="flex gap-1" role="tablist" aria-label="Lesson and practice">
              {[
                { key: "lesson", label: "Lesson", icon: BookOpen },
                { key: "practice", label: "Guided practice", icon: Lightbulb },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={view === tab.key}
                  onClick={() => setView(tab.key)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                    view === tab.key
                      ? "bg-ink-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>
            <Badge tone={session.status === "retry" ? "amber" : "mint"}>
              Attempt {attempt.attempt} of 2
            </Badge>
          </div>

          {view === "lesson" ? (
            <div className="space-y-4">
              <LessonPanel intervention={attempt.intervention} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-xs leading-5 text-slate-500">
                  The Tutor Agent checks each practice answer and offers a hint before revealing the answer.
                </p>
                <Button variant="mint" icon={ArrowRight} onClick={() => setView("practice")}>
                  Go to guided practice
                </Button>
              </div>
            </div>
          ) : (
            <PracticePanel
              key={`${session.id}-${attempt.attempt}`}
              intervention={attempt.intervention}
              sessionId={session.id}
              attemptNumber={attempt.attempt}
              savedAnswers={practiceAnswers}
              onCheck={checkPractice}
              onFinish={finishPractice}
              busy={busy}
              isDemo={session.isDemo}
            />
          )}
        </div>
      );
    }

    if (session.status === "mastery") {
      const mastery = attempt?.mastery;
      if (!mastery) {
        return (
          <Alert tone="warning" title="The mastery check is not ready">
            Refresh the session to load the follow-up questions.
          </Alert>
        );
      }

      return (
        <div className="space-y-4">
          <Alert tone="success" title="Practice complete — the mastery check is ready">
            {attempt.practice?.result?.feedbackSummary} This check uses new questions on the same skill. You need{" "}
            {session.threshold}% to complete the cycle.
          </Alert>
          <Questionnaire
            key={`${session.id}-mastery-${attempt.attempt}`}
            eyebrow={`Mastery check · attempt ${attempt.attempt} of 2`}
            title="Show what changed"
            description="These questions are different from the diagnostic and the practice set. They test whether the rule transfers, not whether you remember the earlier answers."
            icon={Target}
            questions={mastery.questions}
            answers={masteryAnswers}
            onAnswersChange={setMasteryAnswers}
            onSubmit={submitMastery}
            submitLabel="Submit mastery check"
            busy={busy}
            demoNote={
              session.isDemo
                ? "Sample answers are pre-filled: the first attempt deliberately includes one sign slip so the adaptation path is visible if you change it."
                : undefined
            }
            meta={<Badge tone={session.status === "retry" ? "amber" : "sky"}>{session.threshold}% to pass</Badge>}
            footerNote="The Mastery Agent evaluates the answers, then either writes the teacher insight or adapts the intervention once more."
          />
        </div>
      );
    }

    if (session.status === "complete") {
      return (
        <ResultSummary
          session={session}
          onRestart={() => startSession(false)}
          restarting={busy}
          restartLabel="Start another recovery cycle"
        />
      );
    }

    if (session.status === "error") {
      return (
        <div className="space-y-4">
          <Alert tone="error" title="This cycle stopped before it finished">
            {session.error || "An agent step failed. You can restart the cycle without losing the seeded demo data."}
          </Alert>
          <Button variant="danger" icon={RotateCcw} onClick={() => startSession(true)} loading={busy}>
            Restart the diagnostic
          </Button>
        </div>
      );
    }

    return <StartCard learner={learner} onStart={() => startSession(false)} busy={busy} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Learner workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {learner ? `${firstName}'s recovery cycle` : "Learner workspace"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {learner ? `Grade ${learner.grade} · ${learner.subject} · ${learner.topic}` : "Grade 9 Mathematics"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Demo learner</span>
            <select
              value={selectedLearnerId}
              onChange={(event) => setSelectedLearnerId(event.target.value)}
              className="max-w-[10rem] bg-transparent text-sm font-semibold text-ink-950 focus:outline-none"
              aria-label="Choose a demo learner"
            >
              {learners.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <Badge tone={status.tone}>{status.label}</Badge>
          {learner?.isDemo ? (
            <Badge tone="amber" icon={FlaskConical}>
              Demo learner
            </Badge>
          ) : null}
        </div>
      </div>

      <WorkflowStepper session={session} />

      {session && IN_PROGRESS.includes(session.status) ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={learner?.name || "?"} accent={learner?.accent || "mint"} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-950">
                {session.status === "diagnostic"
                  ? "Diagnostic ready"
                  : session.status === "analyzing"
                    ? "Agents analysing"
                    : session.status === "mastery"
                      ? "Mastery check"
                      : "Personalised intervention"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {session.diagnosis?.suspectedGap
                  ? GAP_COPY[session.diagnosis.gapKey] || session.diagnosis.suspectedGap
                  : "Waiting for the diagnostic evidence"}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <ProgressBar value={learner?.progressPercent ?? 0} showValue label="Progress" />
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0">{renderStage()}</div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <AgentTimeline events={liveEvents} session={session} compact />

          {learner?.isDemo ? (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Demo controls</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Sample answers are pre-filled but fully editable. Every submission is evaluated from the answers you
                send — nothing is hard-coded to pass.
              </p>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Mastery attempt 1 contains one deliberate sign slip. Editing that answer changes the outcome.
              </p>
            </Card>
          ) : null}

          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-700">How this works</p>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" aria-hidden="true" />
                Every agent result is validated before it is saved.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" aria-hidden="true" />
                The timeline updates from real orchestrator events.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" aria-hidden="true" />
                Your cycle survives a page refresh.
              </li>
            </ul>
            <Link
              to="/activity"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:text-mint-800"
            >
              Open the activity log
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
