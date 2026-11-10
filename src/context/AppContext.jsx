import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api.js";

const AppContext = createContext(null);
const STORAGE_KEY = "mastery.learner";

export function AppProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);
  const [selectedLearnerId, setSelectedLearnerIdState] = useState(
    () => window.localStorage.getItem(STORAGE_KEY) || "lrn_thabo",
  );
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = useCallback((message, tone = "info") => {
    setToast({ message, tone, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [healthData, learnersData] = await Promise.all([api.health(), api.learners()]);
      setHealth(healthData);
      setLearners(learnersData.learners);
      setBootError(null);
    } catch (error) {
      setBootError(error.message || "Could not reach the MASTERY server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLearners = useCallback(async () => {
    const data = await api.learners();
    setLearners(data.learners);
    return data.learners;
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [load]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selectedLearnerId);
  }, [selectedLearnerId]);

  useEffect(() => {
    if (learners.length === 0) return;
    if (!learners.some((learner) => learner.id === selectedLearnerId)) {
      const fallback = learners.find((learner) => learner.isDemo) || learners[0];
      setSelectedLearnerIdState(fallback.id);
    }
  }, [learners, selectedLearnerId]);

  const setSelectedLearnerId = useCallback((learnerId) => {
    setSelectedLearnerIdState(learnerId);
  }, []);

  const resetDemo = useCallback(async () => {
    await api.resetDemo();
    setSelectedLearnerIdState("lrn_thabo");
    await load();
    notify("Demo data restored. Thabo is ready for a fresh cycle.", "success");
  }, [load, notify]);

  const selectedLearner = learners.find((learner) => learner.id === selectedLearnerId) || null;

  const value = useMemo(
    () => ({
      health,
      learners,
      loading,
      bootError,
      selectedLearner,
      selectedLearnerId,
      setSelectedLearnerId,
      refreshLearners,
      reload: load,
      resetDemo,
      notify,
      toast,
      dismissToast: () => setToast(null),
    }),
    [
      health,
      learners,
      loading,
      bootError,
      selectedLearner,
      selectedLearnerId,
      setSelectedLearnerId,
      refreshLearners,
      load,
      resetDemo,
      notify,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
