import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card, ProgressBar } from "./ui.jsx";
import { cx } from "../lib/cx.js";

export default function PracticePanel({
  intervention,
  sessionId,
  attemptNumber,
  savedAnswers = {},
  onCheck,
  onFinish,
  busy = false,
  isDemo = false,
}) {
  const questions = intervention.practiceQuestions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(savedAnswers || {});
  const [checks, setChecks] = useState({});
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setAnswers(savedAnswers || {});
  }, [savedAnswers]);

  const question = questions[index];
  if (!question) return null;

  const selected = answers[question.id] || "";
  const currentCheck = checks[question.id];
  const answered = questions.filter((item) => String(answers[item.id] ?? "").trim()).length;
  const correctChecked = questions.filter((item) => checks[item.id]?.correct).length;
  const allAnswered = answered === questions.length;

  const choose = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    if (checks[question.id]) {
      setChecks((current) => {
        const next = { ...current };
        delete next[question.id];
        return next;
      });
    }
  };

  const check = async () => {
    if (!selected) return;
    setChecking(true);
    try {
      const result = await onCheck(question.id, selected);
      setChecks((current) => ({ ...current, [question.id]: result }));
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="overflow-hidden" aria-labelledby="practice-heading">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            <span className="rounded-xl bg-mint-50 p-2.5 text-mint-700 ring-1 ring-inset ring-mint-200">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Guided practice · Tutor Agent</p>
              <h2 id="practice-heading" className="mt-1 text-lg font-bold">
                Try it yourself
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Check each answer. A hint appears before the answer is revealed.
              </p>
            </div>
          </div>
          <Badge tone="slate">
            Attempt {attemptNumber} · {answered}/{questions.length} answered
          </Badge>
        </div>

        <ProgressBar value={(answered / questions.length) * 100} className="mt-4" label="Practice progress" showValue />

        <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Practice question navigation">
          {questions.map((item, itemIndex) => {
            const filled = Boolean(String(answers[item.id] ?? "").trim());
            const checked = checks[item.id];
            const isCurrent = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Practice question ${itemIndex + 1}${checked?.correct ? ", correct" : filled ? ", answered" : ", not answered"}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "flex h-7 min-w-7 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold transition",
                  isCurrent
                    ? "border-ink-950 bg-ink-950 text-white"
                    : checked?.correct
                      ? "border-mint-300 bg-mint-50 text-mint-800"
                      : checked
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : filled
                          ? "border-slate-300 bg-slate-100 text-slate-700"
                          : "border-slate-200 text-slate-400 hover:border-slate-300",
                )}
              >
                {checked?.correct ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : itemIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        <fieldset>
          <legend className="sr-only">
            Practice question {index + 1} of {questions.length}
          </legend>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Question {index + 1} of {questions.length}
            </p>
            {isDemo ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <FlaskConical className="h-3 w-3" aria-hidden="true" />
                Demo learner
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-xl font-bold text-ink-950">{question.prompt}</h3>

          <div className="mt-4 grid gap-2" role="radiogroup" aria-label={`Answers for ${question.prompt}`}>
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === option;
              const showCorrect = currentCheck?.correct && isSelected;
              const showWrong = currentCheck && !currentCheck.correct && isSelected;
              return (
                <label
                  key={option}
                  className={cx(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition focus-within:ring-2 focus-within:ring-mint-500 focus-within:ring-offset-1",
                    showCorrect
                      ? "border-mint-500 bg-mint-50 ring-1 ring-mint-500"
                      : showWrong
                        ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400"
                        : isSelected
                          ? "border-mint-400 bg-mint-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name={`practice-${sessionId}-${attemptNumber}-${question.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => choose(option)}
                    className="sr-only"
                  />
                  <span
                    className={cx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                      isSelected ? "bg-ink-950 text-white" : "bg-slate-100 text-slate-600",
                    )}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="font-medium">{option}</span>
                  {showCorrect ? <CheckCircle2 className="ml-auto h-4 w-4 text-mint-600" aria-hidden="true" /> : null}
                  {showWrong ? <XCircle className="ml-auto h-4 w-4 text-amber-600" aria-hidden="true" /> : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        {isDemo && question.demoAnswer ? (
          <button
            type="button"
            onClick={() => choose(question.demoAnswer)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            Use sample answer for the demo
          </button>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Lightbulb}
            onClick={check}
            loading={checking}
            disabled={!selected || busy || Boolean(currentCheck?.correct)}
          >
            {currentCheck ? "Check again" : "Check answer"}
          </Button>
          <span className="text-[11px] text-slate-500">
            {correctChecked}/{questions.length} checked correctly
          </span>
        </div>

        {currentCheck ? (
          <div
            className={cx(
              "mt-4 rounded-xl border p-3.5 text-sm leading-6",
              currentCheck.correct
                ? "border-mint-200 bg-mint-50 text-mint-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              {currentCheck.correct ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <div>
                <p className="font-semibold">{currentCheck.correct ? "Correct" : "Not quite yet"}</p>
                <p className="mt-0.5">{currentCheck.correct ? currentCheck.feedback : currentCheck.hint}</p>
                {!currentCheck.correct ? (
                  <p className="mt-1 text-xs">Try the question again. The correct answer is not shown yet.</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
            Check your answer to get Tutor Agent feedback before moving on. You can retry a question.
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0 || busy}
            >
              Previous
            </Button>
            {index < questions.length - 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
                disabled={busy}
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <Button
            variant="mint"
            size="sm"
            onClick={() => onFinish(answers)}
            loading={busy}
            disabled={!allAnswered || checking}
            icon={TargetIcon}
          >
            {allAnswered ? "Finish practice & start mastery" : `Answer all ${questions.length} questions`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TargetIcon(props) {
  return <ArrowRight {...props} />;
}
