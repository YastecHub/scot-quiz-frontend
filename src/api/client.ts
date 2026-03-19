import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('scot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Shared Types ─────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: number;
}

export interface Question {
  id: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  exam_source: string;
}

// Question without answers (for students during test)
export type QuestionBlind = Omit<Question, 'answer_index' | 'explanation'>;

export interface Topic {
  id: number;
  subject: string;
  name: string;
  slug: string;
  questionCount?: number;
}

export interface Resource {
  id: number;
  subject: string;
  topic: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  resource_type: string;   // 'note' | 'pq'
  created_at: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  subject: string | null;
  time_limit: number;
  is_active: number;
  created_by: number;
  created_at: string;
  question_count?: number;
  attempt_count?: number;
  creator_name?: string;
}

export interface Attempt {
  id: number;
  test_id: number;
  user_id: number;
  started_at: string;
  submitted_at: string | null;
  status: 'in_progress' | 'completed' | 'timed_out';
  score: number | null;
  total: number | null;
  pct: number | null;
}

export interface AttemptResult extends Attempt {
  name: string;
  email: string;
}

export interface ReviewQuestion extends Question {
  position: number;
  chosen_index: number | null;
  student_correct: number;
}

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password }),
  me: () => api.get<AuthUser>('/auth/me'),
};

// ── Open Practice ─────────────────────────────────────────────
export const quizAPI = {
  getSubjects: () => api.get<string[]>('/quiz/subjects'),
  getQuestions: (subject: string, topic?: string, limit?: number) =>
    api.get<Question[]>(`/quiz/${encodeURIComponent(subject)}`, {
      params: { ...(topic && { topic }), ...(limit && { limit }) },
    }),
};

export const topicsAPI = {
  getAll: () => api.get<Topic[]>('/topics'),
  getBySubject: (subject: string) => api.get<Topic[]>(`/topics/${encodeURIComponent(subject)}`),
};

export const resourcesAPI = {
  getAll: (subject?: string) =>
    api.get<Resource[]>('/resources', { params: subject && subject !== 'All' ? { subject } : {} }),
};

export const scoresAPI = {
  save: (subject: string, topic: string | undefined, correct: number, total: number) =>
    api.post('/scores', { subject, topic, correct, total }),
  getSummary: () => api.get('/scores/summary'),
};

// ── Student Attempts ──────────────────────────────────────────
export const attemptsAPI = {
  listTests: () =>
    api.get<(Test & { attempt_id?: number; attempt_status?: string; attempt_pct?: number })[]>('/attempts/tests'),
  start: (testId: number) =>
    api.post<{ attempt: Attempt; time_remaining: number }>(`/attempts/${testId}/start`),
  getActive: (testId: number) =>
    api.get<{
      attempt: Attempt; test: Test;
      questions: QuestionBlind[];
      time_remaining: number;
      saved_answers: Record<number, number | null>;
    }>(`/attempts/${testId}`),
  saveAnswer: (testId: number, question_id: number, chosen_index: number | null) =>
    api.patch(`/attempts/${testId}/answer`, { question_id, chosen_index }),
  submit: (testId: number, answers: Record<number, number | null>) =>
    api.post<{ attempt: Attempt; score: number; total: number; pct: number }>(`/attempts/${testId}/submit`, { answers }),
  review: (testId: number) =>
    api.get<{ attempt: Attempt; test: Test; questions: ReviewQuestion[] }>(`/attempts/${testId}/review`),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  // Questions
  getQuestions: (subject?: string) =>
    api.get<Question[]>('/admin/questions', { params: subject ? { subject } : {} }),
  createQuestion: (data: Omit<Question, 'id'>) =>
    api.post<Question>('/admin/questions', data),
  updateQuestion: (id: number, data: Partial<Question>) =>
    api.put<Question>(`/admin/questions/${id}`, data),
  deleteQuestion: (id: number) =>
    api.delete(`/admin/questions/${id}`),

  // Tests
  getTests: () => api.get<Test[]>('/admin/tests'),
  createTest: (data: Partial<Test>) => api.post<Test>('/admin/tests', data),
  updateTest: (id: number, data: Partial<Test>) => api.put<Test>(`/admin/tests/${id}`, data),
  deleteTest: (id: number) => api.delete(`/admin/tests/${id}`),

  // Test questions
  getTestQuestions: (testId: number) =>
    api.get<Question[]>(`/admin/tests/${testId}/questions`),
  addQuestionsToTest: (testId: number, question_ids: number[]) =>
    api.post(`/admin/tests/${testId}/questions`, { question_ids }),
  removeQuestionFromTest: (testId: number, qId: number) =>
    api.delete(`/admin/tests/${testId}/questions/${qId}`),

  // Results
  getResults: (testId: number) =>
    api.get<{ test: Test; results: AttemptResult[] }>(`/admin/tests/${testId}/results`),
  exportPdf: (testId: number) =>
    api.get(`/admin/tests/${testId}/export.pdf`, { responseType: 'blob' }),

  // Students
  getStudents: () => api.get('/admin/students'),

  // Resources
  getResources: () => api.get<Resource[]>('/admin/resources'),
  uploadResource: (formData: FormData) =>
    api.post<Resource>('/admin/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResource: (id: number) => api.delete(`/admin/resources/${id}`),
};

export default api;
