import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import Overview from "./pages/Overview.jsx";
import LearnerWorkspace from "./pages/LearnerWorkspace.jsx";
import AgentActivity from "./pages/AgentActivity.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import TeacherLearnerDetail from "./pages/TeacherLearnerDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Overview />} />
        <Route path="learner" element={<LearnerWorkspace />} />
        <Route path="activity" element={<AgentActivity />} />
        <Route path="teacher" element={<TeacherDashboard />} />
        <Route path="teacher/learners/:learnerId" element={<TeacherLearnerDetail />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
