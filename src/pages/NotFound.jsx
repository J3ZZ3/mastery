import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Card } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto inline-flex rounded-2xl bg-slate-100 p-3 text-slate-500">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">This page is off the map</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        The workspace route you followed does not exist. Return to the overview or open the learner workspace.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to overview
      </Link>
    </Card>
  );
}
