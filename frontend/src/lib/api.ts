import {
  User,
  Task,
  Surprise,
  EncouragementMessage,
  Reaction,
  CuteNote,
  VoiceNote,
  LessonProgress,
  StreakInfo,
  CombinedStats,
  TimetableItem,
  TaskCategory,
  NotificationItem,
  DisplayNames,
  UserRole
} from '../types';

const TOKEN_KEY = 'shared_study_auth_token';

// The "bridge" to the backend: in production, set VITE_API_URL to your
// deployed backend's URL (e.g. https://your-backend.onrender.com). In local
// dev, leave it unset — requests stay relative ('/api/...') and Vite's dev
// proxy (see vite.config.ts) forwards them to the backend for you.
const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || '';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(url), { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    if (url !== '/api/auth/login') {
      removeStoredToken();
    }
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
    throw new Error(`Expected JSON response from ${url}, received non-JSON`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
}

// Auth API
export async function loginApi(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  setStoredToken(res.token);
  return res;
}

export async function signupApi(
  username: string,
  password: string,
  name: string,
  role: UserRole = 'learner',
  pairCode?: string
): Promise<{ token: string; user: User }> {
  const res = await fetchWithAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, name, role, pairCode })
  });
  setStoredToken(res.token);
  return res;
}

export async function getMeApi(): Promise<User> {
  const res = await fetchWithAuth('/api/auth/me');
  return res.user;
}

// Tasks API
export async function getTasksApi(date?: string, assignedTo?: UserRole): Promise<Task[]> {
  const query = new URLSearchParams();
  if (date) query.append('date', date);
  if (assignedTo) query.append('assignedTo', assignedTo);
  return fetchWithAuth(`/api/tasks?${query.toString()}`);
}

export async function createTaskApi(taskData: {
  title: string;
  category: TaskCategory;
  assignedTo: UserRole;
  date: string;
  requiredForDaily?: boolean;
  important?: boolean;
  timetableSlotId?: string;
}): Promise<Task> {
  return fetchWithAuth('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

export async function toggleTaskApi(id: string): Promise<Task> {
  return fetchWithAuth(`/api/tasks/${id}/toggle`, {
    method: 'PATCH'
  });
}

export async function updateTaskApi(id: string, updates: Partial<Task>): Promise<Task> {
  return fetchWithAuth(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

export async function deleteTaskApi(id: string): Promise<{ message: string }> {
  return fetchWithAuth(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
}

export async function copyRecurringTasksApi(sourceDate: string, targetDate: string, assignedTo?: UserRole) {
  return fetchWithAuth('/api/tasks/copy-recurring', {
    method: 'POST',
    body: JSON.stringify({ sourceDate, targetDate, assignedTo })
  });
}

// Surprises API
export async function getSurprisesApi(): Promise<Surprise[]> {
  return fetchWithAuth('/api/surprises');
}

export async function createSurpriseApi(surpriseData: Partial<Surprise>): Promise<Surprise> {
  return fetchWithAuth('/api/surprises', {
    method: 'POST',
    body: JSON.stringify(surpriseData)
  });
}

export async function markSurpriseViewedApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/surprises/${id}/mark-viewed`, {
    method: 'PATCH'
  });
}

export async function deleteSurpriseApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/surprises/${id}`, {
    method: 'DELETE'
  });
}

// Messages API
export async function getMessagesApi(): Promise<EncouragementMessage[]> {
  return fetchWithAuth('/api/messages');
}

export async function createMessageApi(text: string): Promise<EncouragementMessage> {
  return fetchWithAuth('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

export async function deleteMessageApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/messages/${id}`, {
    method: 'DELETE'
  });
}

// Reactions & Notes API
export async function getReactionsApi(): Promise<Reaction[]> {
  return fetchWithAuth('/api/reactions');
}

export async function sendReactionApi(emoji: string): Promise<Reaction> {
  return fetchWithAuth('/api/reactions', {
    method: 'POST',
    body: JSON.stringify({ emoji })
  });
}

export async function getCuteNotesApi(): Promise<CuteNote[]> {
  return fetchWithAuth('/api/cute-notes');
}

export async function sendCuteNoteApi(text: string): Promise<CuteNote> {
  return fetchWithAuth('/api/cute-notes', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

// Voice Notes API
export async function getVoiceNotesApi(): Promise<VoiceNote[]> {
  return fetchWithAuth('/api/voice-notes');
}

export async function sendVoiceNoteApi(audioData: string, durationSeconds: number): Promise<VoiceNote> {
  return fetchWithAuth('/api/voice-notes', {
    method: 'POST',
    body: JSON.stringify({ audioData, durationSeconds })
  });
}

export async function markVoiceNotePlayedApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/voice-notes/${id}/played`, {
    method: 'PATCH'
  });
}

// Lessons & Stats API
export async function getLessonsApi(): Promise<LessonProgress[]> {
  return fetchWithAuth('/api/lessons');
}

export async function toggleLessonApi(id: string): Promise<LessonProgress> {
  return fetchWithAuth(`/api/lessons/${id}/toggle`, {
    method: 'PATCH'
  });
}

export async function getStreakApi(): Promise<StreakInfo> {
  return fetchWithAuth('/api/stats/streak');
}

export async function getCombinedStatsApi(): Promise<CombinedStats> {
  return fetchWithAuth('/api/stats/combined');
}

// Timetable API
export async function getTimetableApi(ownerRole?: UserRole): Promise<TimetableItem[]> {
  const query = ownerRole ? `?ownerRole=${ownerRole}` : '';
  return fetchWithAuth(`/api/timetable${query}`);
}

export async function createTimetableSlotApi(slotData: Partial<TimetableItem>): Promise<TimetableItem> {
  return fetchWithAuth('/api/timetable', {
    method: 'POST',
    body: JSON.stringify(slotData)
  });
}

export async function deleteTimetableSlotApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/timetable/${id}`, {
    method: 'DELETE'
  });
}

// Notifications API
export async function getNotificationsApi(): Promise<NotificationItem[]> {
  return fetchWithAuth('/api/notifications');
}

export async function markNotificationReadApi(id: string): Promise<void> {
  await fetchWithAuth(`/api/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await fetchWithAuth('/api/notifications/read-all', {
    method: 'POST'
  });
}

// Settings & Display Names API
export async function getDisplayNamesApi(): Promise<DisplayNames> {
  return fetchWithAuth('/api/settings/names');
}

export async function updateDisplayNamesApi(adminName: string, learnerName: string): Promise<DisplayNames> {
  return fetchWithAuth('/api/settings/names', {
    method: 'PUT',
    body: JSON.stringify({ adminName, learnerName })
  });
}
