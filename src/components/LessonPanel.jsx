import { BookOpen, Lightbulb, PenLine, Target } from "lucide-react";
import { Badge, Card } from "./ui.jsx";
import NumberLine from "./NumberLine.jsx";
import { GAP_COPY } from "../lib/constants.js";

export default function LessonPanel({ intervention }) {
  if (!intervention) return null;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="eyebrow">Personalised intervention · Learning Designer Agent</p>
            <h2 className="mt-1.5 text-xl font-bold sm:text-2xl">{intervention.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{intervention.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="mint">{GAP_COPY[intervention.gapKey] || intervention.gapKey}</Badge>
            {intervention.adapted ? <Badge tone="amber">Adapted after mastery check</Badge> : null}
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-xl border border-mint-200 bg-mint-50 p-3.5">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-mint-700" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-mint-800">Learning objective</p>
            <p className="mt-0.5 text-sm font-medium leading-6 text-mint-900">{intervention.objective}</p>
          </div>
        </div>

        {intervention.adaptationNote ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            {intervention.adaptationNote}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <section aria-labelledby="lesson-sections-heading">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <h3 id="lesson-sections-heading" className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Build the idea
            </h3>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {intervention.sections.map((section, index) => (
              <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-ink-950">{section.title}</h4>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        {intervention.numberLine ? (
          <section aria-labelledby="number-line-heading">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <h3 id="number-line-heading" className="text-sm font-bold uppercase tracking-wide text-slate-700">
                See it on a number line
              </h3>
            </div>
            <NumberLine config={intervention.numberLine} />
          </section>
        ) : null}

        <section aria-labelledby="worked-examples-heading">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <h3 id="worked-examples-heading" className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Worked examples
            </h3>
          </div>
          <div className="mt-3 grid gap-3">
            {intervention.workedExamples.map((example, index) => (
              <div key={example.title} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-ink-950">
                    Example {index + 1}: {example.title}
                  </h4>
                  <span className="rounded-lg bg-ink-950 px-2.5 py-1 text-xs font-bold text-white">{example.answer}</span>
                </div>
                <ol className="mt-3 space-y-1.5">
                  {example.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-2.5 text-sm leading-6 text-slate-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Lesson recap">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Remember this</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-800">{intervention.recap}</p>
        </section>
      </div>
    </Card>
  );
}
