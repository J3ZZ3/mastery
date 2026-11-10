import { FlaskConical, ShieldCheck } from "lucide-react";
import { Badge, Card, ConfidenceMeter } from "./ui.jsx";
import { cx } from "../lib/cx.js";

export default function DiagnosisCard({ diagnosis, compact = false, className = "" }) {
  if (!diagnosis) return null;
  const severityTone = diagnosis.severity === "high" ? "amber" : diagnosis.severity === "moderate" ? "sky" : "slate";

  return (
    <Card className={cx(compact ? "p-4" : "p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Diagnostic hypothesis</p>
          <h3 className={cx("mt-1 font-bold", compact ? "text-base" : "text-lg")}>{diagnosis.suspectedGap}</h3>
          <p className="mt-1 text-xs text-slate-500">{diagnosis.relatedConcept}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={diagnosis.isSurfaceLevel ? "sky" : severityTone}>
            {diagnosis.isSurfaceLevel ? "Possible isolated slip" : `${diagnosis.severity} evidence`}
          </Badge>
          <Badge tone="slate" icon={FlaskConical}>
            Agent hypothesis
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        <ConfidenceMeter value={diagnosis.confidence} label="Confidence in this hypothesis" />
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence from the answers</p>
        <ul className="mt-2 space-y-2">
          {(compact ? diagnosis.evidence.slice(0, 2) : diagnosis.evidence).map((item, index) => (
            <li key={index} className="flex gap-2 text-xs leading-5 text-slate-600">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {!compact ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          <span className="font-semibold text-slate-700">Why the agent thinks so: </span>
          {diagnosis.reasoning}
        </p>
      ) : null}

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-500">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        This is a hypothesis supported by evidence, not a permanent learner label. The teacher makes the final decision.
      </p>
    </Card>
  );
}
