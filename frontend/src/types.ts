export type UserRole = 'admin' | 'learner';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  pairId?: string;
}

export type TaskCategory =
  | 'Japanese N4'
  | 'Japanese N5'
  | 'Skills / Internship'
  | 'College Study'
  | 'Exercise'
  | 'General';

export interface Task {
  id: string;
  title: string;
  assignedTo: UserRole; // 'admin' (Me) or 'learner' (Boyfriend)
  createdBy: UserRole;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  completed: boolean;
  requiredForDaily: boolean; // Counts towards daily completion & surprise unlock
  important?: boolean;
  timetableSlotId?: string;
  completedAt?: string;
  createdAt: string;
  pairId?: string;
}

export type SurpriseType =
  | 'sweet_message'
  | 'love_note'
  | 'photo'
  | 'song'
  | 'motivational'
  | 'badge'
  | 'custom_reward';

export type UnlockConditionType =
  | 'all_today_tasks' // Complete all required tasks today
  | 'streak_days'     // Reach a streak of N days
  | 'n5_lesson'       // Complete N5 Lesson X
  | 'milestone'       // Total N5 lessons completed
  | 'scheduled_date'; // Specific date reached

export interface Surprise {
  id: string;
  title: string;
  type: SurpriseType;
  conditionType: UnlockConditionType;
  conditionValue?: string | number; // e.g. 3 for 3-day streak, '5' for Lesson 5, '2026-08-10' for date
  scheduledDate?: string; // YYYY-MM-DD
  unlocked: boolean;
  unlockedAt?: string;
  viewed: boolean;
  viewedAt?: string;
  createdAt: string;
  pairId?: string;
  // Content fields - ONLY sent by server when unlocked or to admin!
  content?: {
    message?: string;
    photoUrl?: string;
    songTitle?: string;
    songArtist?: string;
    songLink?: string;
    badgeName?: string;
    badgeIcon?: string;
    rewardDescription?: string;
  };
}

export interface EncouragementMessage {
  id: string;
  sender: UserRole;
  text: string;
  createdAt: string;
  active: boolean;
  pairId?: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  senderRole: UserRole;
  createdAt: string;
  pairId?: string;
}

export interface CuteNote {
  id: string;
  text: string;
  senderRole: UserRole;
  createdAt: string;
  pairId?: string;
}

export interface VoiceNote {
  id: string;
  audioData: string; // base64 data URI
  durationSeconds: number;
  senderRole: UserRole;
  createdAt: string;
  played?: boolean;
  pairId?: string;
}

export interface LessonProgress {
  id: string;
  level: 'N4' | 'N5';
  lessonNumber: number;
  title: string;
  completed: boolean;
  completedAt?: string;
  pairId?: string;
}

export interface StreakInfo {
  currentStreak: number;
  lastCompletedDate?: string;
  milestonesUnlocked: number[]; // [3, 7, 14, 30]
}

export interface TimetableItem {
  id: string;
  ownerRole: UserRole; // 'admin' or 'learner'
  timeRange: string;
  startHour: number; // 0 - 23
  startMinute: number;
  endHour: number;
  endMinute: number;
  activity: string;
  category: TaskCategory;
  description: string;
  isStudySession: boolean;
  pairId?: string;
}

export type NotificationType =
  | 'cute_note'
  | 'reaction'
  | 'voice_note'
  | 'encouragement'
  | 'surprise'
  | 'task';

export interface NotificationItem {
  id: string;
  recipientRole: UserRole | 'all';
  senderRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  targetTab?: string;
  read: boolean;
  createdAt: string;
  pairId?: string;
}

export interface DisplayNames {
  adminName: string;
  learnerName: string;
}

export interface CombinedStats {
  adminCompletedTasksThisWeek: number;
  learnerCompletedTasksThisWeek: number;
  adminN4LessonsCompleted: number;
  learnerN5LessonsCompleted: number;
  learnerStreak: number;
  totalCombinedTasks: number;
}
