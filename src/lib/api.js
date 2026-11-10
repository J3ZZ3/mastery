const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  learners: () => request("/learners"),
  learnerProgress: (learnerId) => request(`/learners/${learnerId}/progress`),
  createSession: (body) =>
    request("/learning-sessions", { method: "POST", body: JSON.stringify(body) }),
  session: (sessionId) => request(`/learning-sessions/${sessionId}`),
  submitDiagnostic: (sessionId, answers) =>
    request(`/learning-sessions/${sessionId}/diagnostic`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  checkPractice: (sessionId, questionId, answer) =>
    request(`/learning-sessions/${sessionId}/practice/check`, {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    }),
  submitPractice: (sessionId, answers) =>
    request(`/learning-sessions/${sessionId}/practice`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  submitMastery: (sessionId, answers) =>
    request(`/learning-sessions/${sessionId}/mastery`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  teacherOverview: () => request("/teacher/overview"),
  teacherLearner: (learnerId) => request(`/teacher/learners/${learnerId}`),
  activity: (limit = 80) => request(`/activity?limit=${limit}`),
  resetDemo: () => request("/demo/reset", { method: "POST" }),
};
