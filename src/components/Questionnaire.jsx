import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Card, ProgressBar } from "./ui.jsx";
import { cx } from "../lib/cx.js";

export default function Questionnaire({
  eyebrow = "Assessment",
  title,
  description,
  icon: Icon,
  questions,
  answers,
  onAnswersChange,
  onSubmit,
  submitLabel = "Submit answers",
  busy = false,
  meta,
  demoNote,
  footerNote,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [questions.length]);

  const question = questions[index];
  if (!question) return null;

  const answered = questions.filter((item) => String(answers[item.id] ?? "").trim()).length;
  const allAnswered = answered === questions.length;
  const selected = answers[question.id] || "";
  const last = index === questions.length - 1;

  const choose = (value) => {
    onAnswersChange({ ...answers, [question.id]: value });
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            {Icon ? (
              <span className="rounded-xl bg-ink-950 p-2.5 text-mint-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            ) : null}
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">{title}</h2>
              {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
          </div>
          {meta}
        </div>

        <ProgressBar
          value={(answered / questions.length) * 100}
          className="mt-5"
          label={`${answered} of ${questions.length} answered`}
          showValue
        />

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Question navigation">
          {questions.map((item, itemIndex) => {
            const isAnswered = Boolean(String(answers[item.id] ?? "").trim());
            const isCurrent = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Question ${itemIndex + 1}${isAnswered ? ", answered" : ", not answered"}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-bold transition",
                  isCurrent
                    ? "border-ink-950 bg-ink-950 text-white"
                    : isAnswered
                      ? "border-mint-300 bg-mint-50 text-mint-800 hover:bg-mint-100"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                )}
              >
                {isAnswered && !isCurrent ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : itemIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <fieldset>
          <legend className="sr-only">
            Question {index + 1} of {questions.length}
          </legend>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Question {index + 1} of {questions.length}
            </p>
            <p className="text-xs font-medium text-slate-500">Choose one answer</p>
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">{question.prompt}</h3>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label={`Answers for ${question.prompt}`}>
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === option;
              return (
                <label
                  key={option}
                  className={cx(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition focus-within:ring-2 focus-within:ring-mint-500 focus-within:ring-offset-1",
                    isSelected
                      ? "border-mint-500 bg-mint-50 text-ink-950 ring-1 ring-mint-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => choose(option)}
                    className="sr-only"
                  />
                  <span
                    className={cx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      isSelected ? "bg-mint-600 text-white" : "bg-slate-100 text-slate-600",
                    )}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="font-medium">{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {demoNote ? (
          <p className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">
            {demoNote}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
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
          {!last ? (
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

        <div className="flex flex-wrap items-center gap-3">
          {footerNote ? <p className="hidden max-w-xs text-[11px] leading-4 text-slate-500 lg:block">{footerNote}</p> : null}
          <Button
            variant="mint"
            onClick={() => onSubmit(answers)}
            loading={busy}
            disabled={!allAnswered}
            icon={CheckCircle2}
          >
            {allAnswered ? submitLabel : `Answer all ${questions.length} questions`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
