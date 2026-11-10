import { Check, Target } from "lucide-react";
import { WORKFLOW_STEPS } from "../lib/constants.js";
import { workflowPhase } from "../lib/format.js";
import { cx } from "../lib/cx.js";

export default function WorkflowStepper({ session }) {
  const phase = workflowPhase(session);
  const isBusy = session?.status === "analyzing";

  return (
    <ol
      aria-label="Learning recovery steps"
      className="grid grid-cols-3 gap-x-2 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-6 sm:gap-1"
    >
      {WORKFLOW_STEPS.map((step, index) => {
        const complete = index < phase.index || session?.status === "complete";
        const current = index === phase.index && session?.status !== "complete";
        return (
          <li key={step.key} className="relative flex items-center gap-2 sm:flex-col sm:gap-1.5 sm:text-center">
            {index < WORKFLOW_STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cx(
                  "absolute left-[13px] top-7 hidden h-px w-[calc(100%-18px)] sm:block",
                  complete ? "bg-mint-300" : "bg-slate-200",
                )}
              />
            ) : null}
            <span
              className={cx(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                complete
                  ? "border-mint-500 bg-mint-500 text-white"
                  : current
                    ? isBusy
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-ink-950 bg-ink-950 text-white"
                    : "border-slate-200 bg-white text-slate-400",
              )}
              aria-hidden="true"
            >
              {complete ? <Check className="h-3.5 w-3.5" /> : current ? <Target className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={cx(
                "text-[11px] font-semibold sm:text-xs",
                current ? "text-ink-950" : complete ? "text-slate-600" : "text-slate-400",
              )}
              aria-current={current ? "step" : undefined}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
