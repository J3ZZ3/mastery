import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { cx } from "../lib/cx.js";
import { TONE_CLASS } from "../lib/constants.js";

const VARIANTS = {
  primary: "bg-ink-950 text-white shadow-soft hover:bg-ink-800",
  mint: "bg-mint-600 text-white shadow-soft hover:bg-mint-700",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
  darkGhost: "text-slate-300 hover:bg-white/10 hover:text-white",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm sm:text-base",
};

export function buttonClasses(variant = "primary", size = "md", extra = "") {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cx("rounded-2xl border border-slate-200 bg-white shadow-soft", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Badge({ children, tone = "slate", icon: Icon, className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        TONE_CLASS[tone] || TONE_CLASS.slate,
        className,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function ProgressBar({ value = 0, label, tone = "mint", className = "", showValue = false }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const bar =
    tone === "amber"
      ? "bg-amber-500"
      : tone === "sky"
        ? "bg-sky-500"
        : tone === "ink"
          ? "bg-ink-900"
          : "bg-mint-500";

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          {label ? <span className="font-medium text-slate-600">{label}</span> : <span />}
          {showValue ? <span className="font-semibold tabular-nums text-slate-700">{Math.round(clamped)}%</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={label || "Progress"}
        className="h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={cx("h-full rounded-full transition-all duration-500", bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function Avatar({ name, accent = "mint", size = "md", className = "" }) {
  const accents = {
    mint: "bg-mint-100 text-mint-800 ring-mint-200",
    sky: "bg-sky-100 text-sky-800 ring-sky-200",
    amber: "bg-amber-100 text-amber-900 ring-amber-200",
  };
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
  };
  const parts = String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-inset",
        accents[accent] || accents.mint,
        sizes[size],
        className,
      )}
    >
      {parts || "?"}
    </span>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "mint" }) {
  const iconTone = {
    mint: "bg-mint-50 text-mint-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-950">{value}</p>
          {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cx("rounded-xl p-2", iconTone[tone] || iconTone.mint)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-1.5 text-xl font-bold sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Alert({ tone = "info", title, children, className = "" }) {
  const config = {
    info: { icon: Info, classes: "border-sky-200 bg-sky-50 text-sky-900" },
    success: { icon: CheckCircle2, classes: "border-mint-200 bg-mint-50 text-mint-900" },
    warning: { icon: AlertTriangle, classes: "border-amber-200 bg-amber-50 text-amber-900" },
    error: { icon: AlertTriangle, classes: "border-rose-200 bg-rose-50 text-rose-900" },
  }[tone] || { icon: Info, classes: "border-slate-200 bg-slate-50 text-slate-800" };
  const Icon = config.icon;

  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-3 rounded-xl border p-4", config.classes, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="text-sm leading-6">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      {Icon ? (
        <span className="mb-4 rounded-2xl bg-white p-3 text-slate-500 shadow-sm ring-1 ring-slate-200">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-ink-950">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ConfidenceMeter({ value, label = "Confidence" }) {
  const pct = Math.round((Number(value) || 0) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold tabular-nums text-slate-800">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Spinner({ className = "" }) {
  return <Loader2 className={cx("h-5 w-5 animate-spin text-mint-600", className)} aria-hidden="true" />;
}

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const tone = {
    success: { icon: CheckCircle2, classes: "border-mint-200 bg-white text-ink-950" },
    error: { icon: AlertTriangle, classes: "border-rose-200 bg-white text-ink-950" },
    info: { icon: Info, classes: "border-slate-200 bg-white text-ink-950" },
  }[toast.tone] || { icon: Info, classes: "border-slate-200 bg-white text-ink-950" };
  const Icon = tone.icon;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "fixed bottom-5 right-5 z-[60] flex max-w-sm animate-soft-in items-start gap-3 rounded-xl border bg-white p-4 text-ink-950 shadow-lift",
        tone.classes,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-mint-600" aria-hidden="true" />
      <p className="flex-1 text-sm leading-6">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>,
    document.body,
  );
}

export function Modal({ open, onClose, title, description, children, footer }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-ink-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className="relative w-full max-w-md animate-soft-in rounded-2xl border border-slate-200 bg-white p-6 shadow-lift"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
