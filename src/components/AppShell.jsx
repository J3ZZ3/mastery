import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Badge, Button, Modal, Toast } from "./ui.jsx";
import { cx } from "../lib/cx.js";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/learner", label: "My Learning", icon: BookOpen },
  { to: "/activity", label: "Agent Activity", icon: Activity },
  { to: "/teacher", label: "Teacher Dashboard", icon: Users },
];

const TITLES = [
  { match: /^\/teacher\/learners\//, title: "Learner profile" },
  { match: /^\/teacher/, title: "Teacher Dashboard" },
  { match: /^\/learner/, title: "My Learning" },
  { match: /^\/activity/, title: "Agent Activity" },
  { match: /^\//, title: "Overview" },
];

function Wordmark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-500 text-sm font-black text-ink-950 shadow-sm">
        M
      </span>
      <div className={compact ? "min-w-0" : ""}>
        <p className="text-sm font-black tracking-[0.14em] text-white">MASTERY</p>
        <p className="text-[10px] font-medium leading-4 text-slate-400">Nobody gets left behind.</p>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }) {
  return (
    <nav aria-label="Primary" className="space-y-6">
      <div>
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        <div className="mt-2 space-y-1">
          {NAV.slice(0, 3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cx("h-4 w-4", isActive ? "text-mint-300" : "text-slate-500 group-hover:text-slate-300")}
                    aria-hidden="true"
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div>
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Teaching</p>
        <div className="mt-2 space-y-1">
          <NavLink
            to="/teacher"
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Users
                  className={cx("h-4 w-4", isActive ? "text-mint-300" : "text-slate-500 group-hover:text-slate-300")}
                  aria-hidden="true"
                />
                Teacher Dashboard
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function ProviderCard({ provider }) {
  const isOpenAI = provider?.active === "openai";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2">
        {isOpenAI ? (
          <Sparkles className="h-3.5 w-3.5 text-mint-300" aria-hidden="true" />
        ) : (
          <FlaskConical className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
        )}
        <p className="text-[11px] font-semibold text-white">
          {isOpenAI ? "AI provider configured" : "Deterministic demo"}
        </p>
      </div>
      <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
        {provider?.note || "Checking provider mode…"}
      </p>
    </div>
  );
}

function SidebarContent({ onNavigate, onReset }) {
  const { health } = useApp();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Wordmark />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="space-y-3 border-t border-white/10 p-4">
        <ProviderCard provider={health?.provider} />
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset demo data
        </button>
        <p className="px-2 text-[10px] leading-4 text-slate-500">
          Local demo · fictional learners · no sign-in required.
        </p>
      </div>
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { health, resetDemo, notify, toast, dismissToast } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const title = useMemo(
    () => TITLES.find((item) => item.match.test(location.pathname))?.title || "MASTERY",
    [location.pathname],
  );
  const isTeacher = location.pathname.startsWith("/teacher");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
      setResetOpen(false);
      navigate("/");
    } catch (error) {
      notify(error.message || "Could not reset the demo data.", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">
        <SidebarContent onReset={() => setResetOpen(true)} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] animate-soft-in bg-ink-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <Wordmark compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              onNavigate={() => setMobileOpen(false)}
              onReset={() => {
                setMobileOpen(false);
                setResetOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-950">{title}</p>
                <p className="hidden text-[11px] text-slate-500 sm:block">Grade 9 Mathematics · Integers and introductory algebra</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {health?.provider ? (
                <Badge
                  tone={health.provider.active === "openai" ? "mint" : "amber"}
                  icon={health.provider.active === "openai" ? Sparkles : FlaskConical}
                  className="hidden md:inline-flex"
                >
                  {health.provider.active === "openai" ? "AI provider" : "Demo engine"}
                </Badge>
              ) : null}

              <div
                className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                role="group"
                aria-label="Switch experience"
              >
                <NavLink
                  to="/learner"
                  className={cx(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3",
                    !isTeacher ? "bg-white text-ink-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Learner
                </NavLink>
                <NavLink
                  to="/teacher"
                  className={cx(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3",
                    isTeacher ? "bg-white text-ink-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Teacher
                </NavLink>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <Outlet />
        </main>

        <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>
            MASTERY is a hackathon prototype. Diagnoses are hypotheses supported by evidence, not permanent learner labels.
            The teacher remains responsible for educational decisions. All learners are fictional.
          </p>
        </footer>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => (resetting ? null : setResetOpen(false))}
        title="Reset demo data"
        description="This clears any learning cycles created during the demo and restores Thabo, Sipho and Lerato to the original seeded scenario."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetting}>
              Cancel
            </Button>
            <Button variant="danger" icon={RotateCcw} onClick={handleReset} loading={resetting}>
              Reset demo data
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          The reset is immediate and cannot be undone. Your learner selection returns to Thabo Mokoena.
        </div>
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
