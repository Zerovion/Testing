import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  User,
  UserRole,
  Task,
  Surprise,
  EncouragementMessage,
  Reaction,
  CuteNote,
  VoiceNote,
  LessonProgress,
  StreakInfo,
  TimetableItem,
  TaskCategory,
  NotificationItem,
  NotificationType,
  DisplayNames,
  CombinedStats
} from './types';

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shared-study-tracker-secret-key-12345';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface PairDisplayNames {
  adminName: string;
  learnerName: string;
}

interface DataStore {
  users: User[];
  passwords: Record<string, string>; // username -> hashed password
  displayNames?: Record<string, PairDisplayNames>;
  streaks?: Record<string, StreakInfo>;
  tasks: Task[];
  surprises: Surprise[];
  messages: EncouragementMessage[];
  reactions: Reaction[];
  cuteNotes: CuteNote[];
  voiceNotes: VoiceNote[];
  lessons: LessonProgress[];
  streak: StreakInfo;
  notifications: NotificationItem[];
  timetable: TimetableItem[];
}

// Initial default seed state
const initialLessons: LessonProgress[] = [
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `n5-lesson-${i + 1}`,
    level: 'N5' as const,
    lessonNumber: i + 1,
    title: `N5 Lesson ${i + 1}`,
    completed: i < 4, // Lessons 1-4 completed as default example
    completedAt: i < 4 ? new Date().toISOString() : undefined
  })),
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `n4-lesson-${i + 1}`,
    level: 'N4' as const,
    lessonNumber: i + 1,
    title: `N4 Lesson ${i + 1}`,
    completed: i < 12, // 12/25 completed for admin
    completedAt: i < 12 ? new Date().toISOString() : undefined
  }))
];

const todayStr = new Date().toISOString().split('T')[0];

const defaultTimetable: TimetableItem[] = [
  // Admin timetable slots
  {
    id: 'slot-1',
    ownerRole: 'admin',
    timeRange: '7:00 AM – 8:00 AM',
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    activity: 'Wake Up & Morning Routine ☀️',
    category: 'General',
    description: 'Wake up, morning refresh & breakfast',
    isStudySession: false
  },
  {
    id: 'slot-2',
    ownerRole: 'admin',
    timeRange: '8:00 AM – 6:00 PM',
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    activity: 'College 🏫',
    category: 'College Study',
    description: 'Lectures, practicals, campus work',
    isStudySession: false
  },
  {
    id: 'slot-3',
    ownerRole: 'admin',
    timeRange: '6:00 PM – 8:00 PM',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    activity: 'Travel, Meals, Rest & Free Time 🍛',
    category: 'General',
    description: 'Travel home, dinner prep, relax',
    isStudySession: false
  },
  {
    id: 'slot-4',
    ownerRole: 'admin',
    timeRange: '8:00 PM – 10:30 PM',
    startHour: 20,
    startMinute: 0,
    endHour: 22,
    endMinute: 30,
    activity: 'Exercise 🏃‍♀️',
    category: 'Exercise',
    description: 'Workout, cardio, stretching',
    isStudySession: true
  },
  {
    id: 'slot-5',
    ownerRole: 'admin',
    timeRange: '10:00 PM – 10:30 PM',
    startHour: 22,
    startMinute: 0,
    endHour: 22,
    endMinute: 30,
    activity: 'Shower + Dinner 🚿',
    category: 'General',
    description: 'Shower and late dinner',
    isStudySession: false
  },
  {
    id: 'slot-6',
    ownerRole: 'admin',
    timeRange: '10:30 PM – 11:30 PM',
    startHour: 22,
    startMinute: 30,
    endHour: 23,
    endMinute: 30,
    activity: 'Japanese N4 🇯🇵',
    category: 'Japanese N4',
    description: 'N4 grammar, Kanji & vocabulary practice',
    isStudySession: true
  },
  {
    id: 'slot-7',
    ownerRole: 'admin',
    timeRange: '11:30 PM – 12:30 AM',
    startHour: 23,
    startMinute: 30,
    endHour: 0,
    endMinute: 30,
    activity: 'Skills / Internship 💻',
    category: 'Skills / Internship',
    description: 'Coding, DSA problems, project development',
    isStudySession: true
  },
  {
    id: 'slot-8',
    ownerRole: 'admin',
    timeRange: '12:30 AM – 12:55 AM',
    startHour: 0,
    startMinute: 30,
    endHour: 0,
    endMinute: 55,
    activity: 'College Study 📚',
    category: 'College Study',
    description: 'Assignments, exam prep & lecture revision',
    isStudySession: true
  },
  {
    id: 'slot-9',
    ownerRole: 'admin',
    timeRange: '12:55 AM – 1:00 AM',
    startHour: 0,
    startMinute: 55,
    endHour: 1,
    endMinute: 0,
    activity: 'Sleep Preparation 🌙',
    category: 'General',
    description: 'Wind down, set alarms',
    isStudySession: false
  },
  {
    id: 'slot-10',
    ownerRole: 'admin',
    timeRange: '1:00 AM – 7:00 AM',
    startHour: 1,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    activity: 'Sleep 😴',
    category: 'General',
    description: 'Rest and recovery',
    isStudySession: false
  }
];

const defaultStore: DataStore = {
  users: [
    { id: 'user-admin', username: 'admin', name: 'Aboli (Admin)', role: 'admin', pairId: 'default' },
    { id: 'user-learner', username: 'learner', name: 'Boyfriend (Learner)', role: 'learner', pairId: 'default' }
  ],
  passwords: {
    admin: bcrypt.hashSync('password123', 8),
    learner: bcrypt.hashSync('password123', 8)
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Revise Hiragana & Katakana',
      assignedTo: 'learner',
      createdBy: 'admin',
      category: 'Japanese N5',
      date: todayStr,
      completed: true,
      requiredForDaily: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Learn 15 new N5 vocabulary words',
      assignedTo: 'learner',
      createdBy: 'admin',
      category: 'Japanese N5',
      date: todayStr,
      completed: true,
      requiredForDaily: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'Complete N5 Lesson 4 Grammar',
      assignedTo: 'learner',
      createdBy: 'admin',
      category: 'Japanese N5',
      date: todayStr,
      completed: true,
      requiredForDaily: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'Practice 10 Japanese sentences',
      assignedTo: 'learner',
      createdBy: 'admin',
      category: 'Japanese N5',
      date: todayStr,
      completed: false,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-5',
      title: "Complete today's N5 practice quiz",
      assignedTo: 'learner',
      createdBy: 'admin',
      category: 'Japanese N5',
      date: todayStr,
      completed: false,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    },
    // Admin personal daily tasks
    {
      id: 'task-admin-1',
      title: 'Japanese N4 — Complete N4 Lesson 13 Grammar',
      assignedTo: 'admin',
      createdBy: 'admin',
      category: 'Japanese N4',
      date: todayStr,
      completed: true,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-admin-2',
      title: 'Skills / Internship — Solve 2 DSA problems',
      assignedTo: 'admin',
      createdBy: 'admin',
      category: 'Skills / Internship',
      date: todayStr,
      completed: false,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-admin-3',
      title: "College Study — Revise today's lecture notes",
      assignedTo: 'admin',
      createdBy: 'admin',
      category: 'College Study',
      date: todayStr,
      completed: false,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-admin-4',
      title: 'Exercise — 45 mins cardio & stretching',
      assignedTo: 'admin',
      createdBy: 'admin',
      category: 'Exercise',
      date: todayStr,
      completed: true,
      requiredForDaily: true,
      createdAt: new Date().toISOString()
    }
  ],
  surprises: [
    {
      id: 'surprise-1',
      title: "Today's Special Reward 🎁",
      type: 'sweet_message',
      conditionType: 'all_today_tasks',
      scheduledDate: todayStr,
      unlocked: false,
      viewed: false,
      createdAt: new Date().toISOString(),
      content: {
        message: "You did an amazing job today! I'm really proud of you ❤️ Keep going — one day at a time! I love seeing your dedication to Japanese!"
      }
    },
    {
      id: 'surprise-2',
      title: '5-Day Streak Trophy 🏆',
      type: 'badge',
      conditionType: 'streak_days',
      conditionValue: 5,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
      viewed: true,
      viewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      content: {
        badgeName: 'N5 Samurai Master 🗡️',
        badgeIcon: '🔥',
        message: '5 Days in a row! You are unstoppable!'
      }
    }
  ],
  messages: [
    {
      id: 'msg-1',
      sender: 'admin',
      text: "You can do it! ❤️ Just two more tasks left for today's surprise! I'm so proud of your progress 🥰",
      createdAt: new Date().toISOString(),
      active: true
    }
  ],
  reactions: [
    {
      id: 'react-1',
      emoji: '❤️',
      senderRole: 'learner',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'react-2',
      emoji: '🥰',
      senderRole: 'learner',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  cuteNotes: [
    {
      id: 'note-1',
      text: "I'm working hard on N5 Lesson 4! Miss you 🥺❤️",
      senderRole: 'learner',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  voiceNotes: [],
  lessons: initialLessons,
  streak: {
    currentStreak: 5,
    lastCompletedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    milestonesUnlocked: [3, 5]
  },
  notifications: [
    {
      id: 'notif-1',
      recipientRole: 'learner',
      senderRole: 'admin',
      type: 'encouragement',
      title: '💌 New message from Aboli',
      message: "You can do it! ❤️ Just two more tasks left for today's surprise!",
      targetTab: 'messages',
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  timetable: defaultTimetable
};

// Load or write data store
let db: DataStore = defaultStore;
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    db = JSON.parse(raw);
    // ensure structure matches
    if (!db.tasks) db.tasks = defaultStore.tasks;
    if (!db.surprises) db.surprises = defaultStore.surprises;
    if (!db.messages) db.messages = defaultStore.messages;
    if (!db.reactions) db.reactions = defaultStore.reactions;
    if (!db.cuteNotes) db.cuteNotes = defaultStore.cuteNotes;
    if (!db.voiceNotes) db.voiceNotes = defaultStore.voiceNotes;
    if (!db.lessons) db.lessons = defaultStore.lessons;
    if (!db.streak) db.streak = defaultStore.streak;
    if (!db.notifications) db.notifications = defaultStore.notifications;
    if (!db.timetable || db.timetable.length === 0 || db.timetable.some(s => s.id && s.id.startsWith('slot-learner-'))) {
      db.timetable = defaultTimetable;
    }
  } catch (err) {
    console.error('Error reading DB file, using defaults:', err);
  }
} else {
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB file:', err);
  }
}

function getPairDisplayNames(pairId: string = 'default'): PairDisplayNames {
  if (!db.displayNames) {
    db.displayNames = {};
  }
  if (db.displayNames[pairId]) {
    return db.displayNames[pairId];
  }
  const adminUser = db.users.find(u => u.role === 'admin' && (u.pairId === pairId || (!u.pairId && pairId === 'default')));
  const learnerUser = db.users.find(u => u.role === 'learner' && (u.pairId === pairId || (!u.pairId && pairId === 'default')));

  const names: PairDisplayNames = {
    adminName: adminUser?.name || 'Aboli',
    learnerName: learnerUser?.name || 'Boyfriend'
  };
  db.displayNames[pairId] = names;
  return names;
}

function updatePairDisplayNames(pairId: string = 'default', adminName: string, learnerName: string): PairDisplayNames {
  if (!db.displayNames) {
    db.displayNames = {};
  }
  const cleanAdmin = adminName.trim();
  const cleanLearner = learnerName.trim();

  db.displayNames[pairId] = {
    adminName: cleanAdmin,
    learnerName: cleanLearner
  };

  let adminUser = db.users.find(u => u.role === 'admin' && (u.pairId === pairId || (!u.pairId && pairId === 'default')));
  if (adminUser) {
    adminUser.name = cleanAdmin;
  } else {
    adminUser = {
      id: `user-admin-${Date.now()}`,
      username: 'admin',
      name: cleanAdmin,
      role: 'admin',
      pairId
    };
    db.users.push(adminUser);
  }

  let learnerUser = db.users.find(u => u.role === 'learner' && (u.pairId === pairId || (!u.pairId && pairId === 'default')));
  if (learnerUser) {
    learnerUser.name = cleanLearner;
  } else {
    learnerUser = {
      id: `user-learner-${Date.now()}`,
      username: 'learner',
      name: cleanLearner,
      role: 'learner',
      pairId
    };
    db.users.push(learnerUser);
  }

  saveDb();
  return db.displayNames[pairId];
}

function getPairStreak(pairId: string = 'default'): StreakInfo {
  if (!db.streaks) {
    db.streaks = {};
  }
  if (db.streaks[pairId]) {
    return db.streaks[pairId];
  }
  if (pairId === 'default' && db.streak) {
    db.streaks['default'] = db.streak;
    return db.streaks['default'];
  }
  const newStreak: StreakInfo = {
    currentStreak: 0,
    lastCompletedDate: undefined,
    milestonesUnlocked: []
  };
  db.streaks[pairId] = newStreak;
  saveDb();
  return db.streaks[pairId];
}

// Notification Helper
function createNotification(
  recipientRole: 'admin' | 'learner' | 'all',
  senderRole: 'admin' | 'learner',
  type: NotificationType,
  title: string,
  message: string,
  targetTab?: string,
  pairId: string = 'default'
) {
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientRole,
    senderRole,
    type,
    title,
    message,
    targetTab,
    read: false,
    createdAt: new Date().toISOString(),
    pairId
  };
  db.notifications.unshift(newNotif);
  saveDb();
  return newNotif;
}

// Fixed Weekday Timetable Schedule definitions
const TIMETABLE_SLOTS: TimetableItem[] = [
  {
    id: 'slot-1',
    ownerRole: 'admin',
    timeRange: '7:00 AM – 8:00 AM',
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    activity: 'Wake Up & Morning Routine ☀️',
    category: 'General',
    description: 'Wake up, morning refresh & breakfast',
    isStudySession: false
  },
  {
    id: 'slot-2',
    ownerRole: 'admin',
    timeRange: '8:00 AM – 6:00 PM',
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    activity: 'College 🏫',
    category: 'College Study',
    description: 'Lectures, practicals, campus work',
    isStudySession: false
  },
  {
    id: 'slot-3',
    ownerRole: 'admin',
    timeRange: '6:00 PM – 8:00 PM',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    activity: 'Travel, Meals, Rest & Free Time 🍛',
    category: 'General',
    description: 'Travel home, dinner prep, relax',
    isStudySession: false
  },
  {
    id: 'slot-4',
    ownerRole: 'admin',
    timeRange: '8:00 PM – 10:30 PM',
    startHour: 20,
    startMinute: 0,
    endHour: 22,
    endMinute: 30,
    activity: 'Exercise 🏃‍♀️',
    category: 'Exercise',
    description: 'Workout, cardio, stretching',
    isStudySession: true
  },
  {
    id: 'slot-5',
    ownerRole: 'admin',
    timeRange: '10:00 PM – 10:30 PM',
    startHour: 22,
    startMinute: 0,
    endHour: 22,
    endMinute: 30,
    activity: 'Shower + Dinner 🚿',
    category: 'General',
    description: 'Shower and late dinner',
    isStudySession: false
  },
  {
    id: 'slot-6',
    ownerRole: 'admin',
    timeRange: '10:30 PM – 11:30 PM',
    startHour: 22,
    startMinute: 30,
    endHour: 23,
    endMinute: 30,
    activity: 'Japanese N4 🇯🇵',
    category: 'Japanese N4',
    description: 'N4 grammar, Kanji & vocabulary practice',
    isStudySession: true
  },
  {
    id: 'slot-7',
    ownerRole: 'admin',
    timeRange: '11:30 PM – 12:30 AM',
    startHour: 23,
    startMinute: 30,
    endHour: 0,
    endMinute: 30,
    activity: 'Skills / Internship 💻',
    category: 'Skills / Internship',
    description: 'Coding, DSA problems, project development',
    isStudySession: true
  },
  {
    id: 'slot-8',
    ownerRole: 'admin',
    timeRange: '12:30 AM – 12:55 AM',
    startHour: 0,
    startMinute: 30,
    endHour: 0,
    endMinute: 55,
    activity: 'College Study 📚',
    category: 'College Study',
    description: 'Assignments, exam prep & lecture revision',
    isStudySession: true
  },
  {
    id: 'slot-9',
    ownerRole: 'admin',
    timeRange: '12:55 AM – 1:00 AM',
    startHour: 0,
    startMinute: 55,
    endHour: 1,
    endMinute: 0,
    activity: 'Sleep Preparation 🌙',
    category: 'General',
    description: 'Wind down, set alarms',
    isStudySession: false
  },
  {
    id: 'slot-10',
    ownerRole: 'admin',
    timeRange: '1:00 AM – 7:00 AM',
    startHour: 1,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    activity: 'Sleep 😴',
    category: 'General',
    description: 'Rest and recovery',
    isStudySession: false
  }
];

// Helper to check surprise conditions
function isSurpriseUnlockedForLearner(s: Surprise, learnerTasksToday: Task[], pairId: string = 'default'): { unlocked: boolean; progress: string } {
  const reqTasks = learnerTasksToday.filter(t => t.requiredForDaily);
  const tasksToCheck = reqTasks.length > 0 ? reqTasks : learnerTasksToday;
  const completedReq = tasksToCheck.filter(t => t.completed).length;
  const totalReq = tasksToCheck.length;
  const isAllTasksCompleted = totalReq > 0 && completedReq === totalReq;

  switch (s.conditionType) {
    case 'all_today_tasks': {
      const progress = `${completedReq}/${totalReq} Tasks Completed`;
      return { unlocked: isAllTasksCompleted, progress };
    }
    case 'streak_days': {
      const target = Number(s.conditionValue) || 3;
      const curStreak = getPairStreak(pairId).currentStreak;
      const progress = `Streak: ${curStreak}/${target} Days`;
      return { unlocked: curStreak >= target, progress };
    }
    case 'n5_lesson': {
      const targetLesson = Number(s.conditionValue) || 5;
      const lesson = db.lessons.find(l => (l.pairId || 'default') === pairId && l.level === 'N5' && l.lessonNumber === targetLesson);
      const isDone = Boolean(lesson?.completed);
      const progress = isDone ? 'Lesson Completed!' : `Complete Lesson ${targetLesson}`;
      return { unlocked: isDone, progress };
    }
    case 'milestone': {
      const target = Number(s.conditionValue) || 10;
      const countCompleted = db.lessons.filter(l => (l.pairId || 'default') === pairId && l.level === 'N5' && l.completed).length;
      const progress = `${countCompleted}/${target} N5 Lessons`;
      return { unlocked: countCompleted >= target, progress };
    }
    case 'scheduled_date': {
      const curDate = new Date().toISOString().split('T')[0];
      const targetDate = s.scheduledDate || curDate;
      const dateReached = curDate >= targetDate;
      const unlocked = dateReached && isAllTasksCompleted;
      const progress = dateReached
        ? `${completedReq}/${totalReq} Tasks Completed`
        : `Scheduled for ${targetDate}`;
      return { unlocked, progress };
    }
    default:
      return { unlocked: s.unlocked, progress: '' };
  }
}

// Server App setup
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Enable CORS & handle OPTIONS preflight requests.
  // This is the "bridge" between the separately-deployed frontend and this
  // backend: set FRONTEND_ORIGIN to your deployed frontend's URL (e.g.
  // https://your-app.vercel.app) so only that origin can call the API. Falls
  // back to '*' (any origin) if unset, which is fine for local dev/testing.
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // JWT auth middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  const getUserPairId = (req: any): string => {
    if (req.user?.pairId) return req.user.pairId;
    const user = db.users.find(u => u.id === req.user?.id);
    if (user && !user.pairId) {
      user.pairId = 'default';
    }
    return user?.pairId || 'default';
  };

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { username, password, name, role, pairCode } = req.body;

    if (!username?.trim() || !password?.trim() || !name?.trim()) {
      return res.status(400).json({ error: 'Username, password, and display name are required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    const existingUser = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another username.' });
    }

    const validRole: UserRole = role === 'admin' ? 'admin' : 'learner';

    let assignedPairId = `pair-${Date.now()}`;
    if (pairCode?.trim()) {
      const code = pairCode.trim();
      if (code.toLowerCase() === 'default' || code.toLowerCase() === 'love2026') {
        assignedPairId = 'default';
      } else {
        const match = db.users.find(u => u.pairId === code || u.username.toLowerCase() === code.toLowerCase());
        if (match && match.pairId) {
          assignedPairId = match.pairId;
        } else {
          assignedPairId = code;
        }
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      username: cleanUsername,
      name: name.trim(),
      role: validRole,
      pairId: assignedPairId
    };

    db.users.push(newUser);
    db.passwords[cleanUsername] = bcrypt.hashSync(password, 8);
    saveDb();

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role, name: newUser.name, pairId: newUser.pairId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, user: newUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username.toLowerCase() === username?.toLowerCase().trim());

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const hashed = db.passwords[user.username];
    if (!hashed || !bcrypt.compareSync(password, hashed)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    if (!user.pairId) {
      user.pairId = 'default';
      saveDb();
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name, pairId: user.pairId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  // Tasks Routes
  app.get('/api/tasks', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const { date, assignedTo } = req.query;
    let list = db.tasks.filter(t => (t.pairId || 'default') === pairId);

    if (date) {
      list = list.filter(t => t.date === date);
    }
    if (assignedTo) {
      list = list.filter(t => t.assignedTo === assignedTo);
    }

    // Role filtering: Learner should only view tasks assigned to him, Admin views all
    if (req.user.role === 'learner') {
      list = list.filter(t => t.assignedTo === 'learner');
    }

    res.json(list);
  });

  app.post('/api/tasks', authenticateToken, (req: any, res) => {
    const { title, category, assignedTo, date, requiredForDaily, important, timetableSlotId } = req.body;

    if (!title || !category || !assignedTo || !date) {
      return res.status(400).json({ error: 'Missing required task fields' });
    }

    // Learner cannot create tasks for Admin
    if (req.user.role === 'learner' && assignedTo !== 'learner') {
      return res.status(403).json({ error: 'Learners can only add personal tasks for themselves' });
    }

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const adminName = names.adminName;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      assignedTo,
      createdBy: req.user.role,
      category: category as TaskCategory,
      date,
      completed: false,
      requiredForDaily: Boolean(requiredForDaily),
      important: Boolean(important),
      timetableSlotId,
      createdAt: new Date().toISOString(),
      pairId
    };

    db.tasks.push(newTask);

    if (assignedTo === 'learner' && req.user.role === 'admin') {
      createNotification(
        'learner',
        'admin',
        'task',
        `📝 New task assigned by ${adminName}`,
        newTask.title,
        'tasks',
        pairId
      );
    }

    saveDb();

    res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id/toggle', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const task = db.tasks.find(t => t.id === id && (t.pairId || 'default') === pairId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Learner can only toggle tasks assigned to him
    if (req.user.role === 'learner' && task.assignedTo !== 'learner') {
      return res.status(403).json({ error: 'Unauthorized to modify this task' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;

    // Recalculate streak if learner completed all required tasks today
    if (task.assignedTo === 'learner') {
      const learnerTasksToday = db.tasks.filter(t => (t.pairId || 'default') === pairId && t.assignedTo === 'learner' && t.date === task.date);
      const reqTasks = learnerTasksToday.filter(t => t.requiredForDaily);
      const tasksToCheck = reqTasks.length > 0 ? reqTasks : learnerTasksToday;
      const allDone = tasksToCheck.length > 0 && tasksToCheck.every(t => t.completed);

      const pairStreak = getPairStreak(pairId);

      if (allDone) {
        if (pairStreak.lastCompletedDate !== task.date) {
          pairStreak.currentStreak += 1;
          pairStreak.lastCompletedDate = task.date;
          if (!pairStreak.milestonesUnlocked) pairStreak.milestonesUnlocked = [];
          if (!pairStreak.milestonesUnlocked.includes(pairStreak.currentStreak)) {
            pairStreak.milestonesUnlocked.push(pairStreak.currentStreak);
          }
        }
      } else if (pairStreak.lastCompletedDate === task.date) {
        if (pairStreak.currentStreak > 0) {
          pairStreak.currentStreak -= 1;
        }
        pairStreak.lastCompletedDate = undefined;
      }
    }

    saveDb();
    res.json(task);
  });

  app.put('/api/tasks/:id', authenticateToken, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const taskIndex = db.tasks.findIndex(t => t.id === id && (t.pairId || 'default') === pairId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, category, assignedTo, date, requiredForDaily, important } = req.body;

    db.tasks[taskIndex] = {
      ...db.tasks[taskIndex],
      title: title ?? db.tasks[taskIndex].title,
      category: category ?? db.tasks[taskIndex].category,
      assignedTo: assignedTo ?? db.tasks[taskIndex].assignedTo,
      date: date ?? db.tasks[taskIndex].date,
      requiredForDaily: requiredForDaily ?? db.tasks[taskIndex].requiredForDaily,
      important: important ?? db.tasks[taskIndex].important
    };

    saveDb();
    res.json(db.tasks[taskIndex]);
  });

  app.delete('/api/tasks/:id', authenticateToken, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const initialLen = db.tasks.length;
    db.tasks = db.tasks.filter(t => !(t.id === id && (t.pairId || 'default') === pairId));

    if (db.tasks.length === initialLen) {
      return res.status(404).json({ error: 'Task not found' });
    }

    saveDb();
    res.json({ message: 'Task deleted successfully' });
  });

  app.post('/api/tasks/copy-recurring', authenticateToken, requireAdmin, (req: any, res) => {
    const { sourceDate, targetDate, assignedTo } = req.body;

    if (!sourceDate || !targetDate) {
      return res.status(400).json({ error: 'sourceDate and targetDate are required' });
    }

    const pairId = getUserPairId(req);
    let sourceTasks = db.tasks.filter(t => (t.pairId || 'default') === pairId && t.date === sourceDate);
    if (assignedTo) {
      sourceTasks = sourceTasks.filter(t => t.assignedTo === assignedTo);
    }

    const copiedTasks: Task[] = sourceTasks.map(t => ({
      ...t,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: targetDate,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      pairId
    }));

    db.tasks.push(...copiedTasks);
    saveDb();

    res.json({ message: `Copied ${copiedTasks.length} tasks to ${targetDate}`, copiedTasks });
  });

  // Surprises Routes - Critical Security Enforcement!
  app.get('/api/surprises', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const learnerTasksToday = db.tasks.filter(t => (t.pairId || 'default') === pairId && t.assignedTo === 'learner' && t.date === todayStr);
    const surprises = db.surprises.filter(s => (s.pairId || 'default') === pairId);

    if (req.user.role === 'admin') {
      // Admin sees complete surprise data including content and status
      const response = surprises.map(s => {
        const { unlocked, progress } = isSurpriseUnlockedForLearner(s, learnerTasksToday, pairId);
        return {
          ...s,
          currentUnlockedState: unlocked || s.unlocked,
          progressInfo: progress
        };
      });
      return res.json(response);
    }

    // Learner View: PROTECT CONTENT ON SERVER LEVEL!
    const response = surprises.map(s => {
      const { unlocked, progress } = isSurpriseUnlockedForLearner(s, learnerTasksToday, pairId);
      const isUnlocked = s.unlocked || unlocked;

      if (isUnlocked) {
        // Auto-mark unlocked in db
        if (!s.unlocked) {
          s.unlocked = true;
          s.unlockedAt = new Date().toISOString();
          saveDb();
        }
        return {
          id: s.id,
          title: s.title,
          type: s.type,
          conditionType: s.conditionType,
          unlocked: true,
          unlockedAt: s.unlockedAt,
          viewed: s.viewed,
          content: s.content, // Content only attached if server verifies unlocked!
          progressInfo: progress
        };
      } else {
        // LOCKED: STRICTLY DO NOT EXPOSE CONTENT OBJECT!
        return {
          id: s.id,
          title: s.title,
          type: s.type,
          conditionType: s.conditionType,
          unlocked: false,
          progressInfo: progress,
          viewed: false
          // content is omitted completely
        };
      }
    });

    res.json(response);
  });

  app.post('/api/surprises', authenticateToken, requireAdmin, (req: any, res) => {
    const { title, type, conditionType, conditionValue, scheduledDate, content } = req.body;

    if (!title || !type || !conditionType) {
      return res.status(400).json({ error: 'Missing required surprise fields' });
    }

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const adminName = names.adminName;

    const newSurprise: Surprise = {
      id: `surprise-${Date.now()}`,
      title,
      type,
      conditionType,
      conditionValue,
      scheduledDate,
      unlocked: false,
      viewed: false,
      createdAt: new Date().toISOString(),
      content: content || { message: 'A sweet surprise awaits you!' },
      pairId
    };

    db.surprises.push(newSurprise);

    createNotification(
      'learner',
      'admin',
      'surprise',
      `🎁 New surprise added by ${adminName}`,
      title,
      'surprises',
      pairId
    );

    saveDb();

    res.status(201).json(newSurprise);
  });

  app.patch('/api/surprises/:id/mark-viewed', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const surprise = db.surprises.find(s => s.id === id && (s.pairId || 'default') === pairId);

    if (!surprise) {
      return res.status(404).json({ error: 'Surprise not found' });
    }

    surprise.viewed = true;
    surprise.viewedAt = new Date().toISOString();
    saveDb();

    res.json({ message: 'Surprise marked as viewed', surprise });
  });

  app.delete('/api/surprises/:id', authenticateToken, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    db.surprises = db.surprises.filter(s => !(s.id === id && (s.pairId || 'default') === pairId));
    saveDb();
    res.json({ message: 'Surprise deleted successfully' });
  });

  // Encouragement Messages
  app.get('/api/messages', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const activeMsg = db.messages.filter(m => (m.pairId || 'default') === pairId && m.active);
    res.json(activeMsg);
  });

  app.post('/api/messages', authenticateToken, requireAdmin, (req: any, res) => {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const adminName = names.adminName;

    const msg: EncouragementMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      active: true,
      pairId
    };

    db.messages.unshift(msg);

    createNotification(
      'learner',
      'admin',
      'encouragement',
      `🔔 New message from ${adminName}`,
      text.trim().substring(0, 100),
      'messages',
      pairId
    );

    saveDb();
    res.status(201).json(msg);
  });

  app.delete('/api/messages/:id', authenticateToken, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    db.messages = db.messages.filter(m => !(m.id === id && (m.pairId || 'default') === pairId));
    saveDb();
    res.json({ message: 'Message deleted' });
  });

  // Reactions
  app.get('/api/reactions', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    res.json(db.reactions.filter(r => (r.pairId || 'default') === pairId));
  });

  app.post('/api/reactions', authenticateToken, (req: any, res) => {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const senderName = req.user.role === 'admin' ? names.adminName : names.learnerName;
    const recipientRole = req.user.role === 'admin' ? 'learner' : 'admin';

    const reaction: Reaction = {
      id: `react-${Date.now()}`,
      emoji,
      senderRole: req.user.role,
      createdAt: new Date().toISOString(),
      pairId
    };

    db.reactions.unshift(reaction);

    createNotification(
      recipientRole,
      req.user.role,
      'reaction',
      `❤️ New reaction from ${senderName}`,
      `Reacted with ${emoji}`,
      'messages',
      pairId
    );

    saveDb();
    res.status(201).json(reaction);
  });

  // Cute Notes
  app.get('/api/cute-notes', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    res.json(db.cuteNotes.filter(n => (n.pairId || 'default') === pairId));
  });

  app.post('/api/cute-notes', authenticateToken, (req: any, res) => {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Note text required' });

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const senderName = req.user.role === 'admin' ? names.adminName : names.learnerName;
    const recipientRole = req.user.role === 'admin' ? 'learner' : 'admin';

    const note: CuteNote = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      senderRole: req.user.role,
      createdAt: new Date().toISOString(),
      pairId
    };

    db.cuteNotes.unshift(note);

    createNotification(
      recipientRole,
      req.user.role,
      'cute_note',
      `💌 New message from ${senderName}`,
      text.trim().substring(0, 100),
      'messages',
      pairId
    );

    saveDb();
    res.status(201).json(note);
  });

  // Voice Notes
  app.get('/api/voice-notes', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    res.json(db.voiceNotes.filter(v => (v.pairId || 'default') === pairId));
  });

  app.post('/api/voice-notes', authenticateToken, (req: any, res) => {
    const { audioData, durationSeconds } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const pairId = getUserPairId(req);
    const names = getPairDisplayNames(pairId);
    const senderName = req.user.role === 'admin' ? names.adminName : names.learnerName;
    const recipientRole = req.user.role === 'admin' ? 'learner' : 'admin';

    const voiceNote: VoiceNote = {
      id: `voice-${Date.now()}`,
      audioData,
      durationSeconds: durationSeconds || 5,
      senderRole: req.user.role,
      createdAt: new Date().toISOString(),
      played: false,
      pairId
    };

    db.voiceNotes.unshift(voiceNote);

    createNotification(
      recipientRole,
      req.user.role,
      'voice_note',
      `🎤 New voice message from ${senderName}`,
      `Sent a ${durationSeconds || 5}s audio message`,
      'messages',
      pairId
    );

    saveDb();
    res.status(201).json(voiceNote);
  });

  app.patch('/api/voice-notes/:id/played', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const vn = db.voiceNotes.find(v => v.id === id && (v.pairId || 'default') === pairId);
    if (vn) {
      vn.played = true;
      saveDb();
    }
    res.json({ success: true });
  });

  // Notifications API
  app.get('/api/notifications', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const userRole = req.user.role;
    const list = db.notifications.filter(
      n => (n.pairId || 'default') === pairId && (n.recipientRole === userRole || n.recipientRole === 'all')
    );
    res.json(list);
  });

  app.patch('/api/notifications/:id/read', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const item = db.notifications.find(n => n.id === id && (n.pairId || 'default') === pairId);
    if (item) {
      item.read = true;
      saveDb();
    }
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const userRole = req.user.role;
    db.notifications.forEach(n => {
      if ((n.pairId || 'default') === pairId && (n.recipientRole === userRole || n.recipientRole === 'all')) {
        n.read = true;
      }
    });
    saveDb();
    res.json({ success: true });
  });

  // Settings / Display Names API
  app.get('/api/settings/names', (req: any, res) => {
    let pairId = 'default';
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          pairId = decoded.pairId || 'default';
        } catch (e) {
          // ignore token error
        }
      }
    }
    res.json(getPairDisplayNames(pairId));
  });

  app.put('/api/settings/names', authenticateToken, (req: any, res) => {
    const { adminName, learnerName } = req.body;

    if (!adminName?.trim() || !learnerName?.trim()) {
      return res.status(400).json({ error: 'Admin name and Learner name cannot be empty' });
    }

    const pairId = getUserPairId(req);
    const updated = updatePairDisplayNames(pairId, adminName, learnerName);
    res.json(updated);
  });

  // Timetable Routes
  app.get('/api/timetable', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    let list = db.timetable.filter(t => (t.pairId || 'default') === pairId);
    if (list.length === 0) {
      const cloned = TIMETABLE_SLOTS.map((slot, i) => ({
        ...slot,
        id: `slot-${pairId}-${i + 1}`,
        pairId
      }));
      db.timetable.push(...cloned);
      saveDb();
      list = cloned;
    }
    res.json(list);
  });

  app.post('/api/timetable', authenticateToken, (req: any, res) => {
    const {
      ownerRole,
      timeRange,
      startHour,
      startMinute,
      endHour,
      endMinute,
      activity,
      category,
      description,
      isStudySession
    } = req.body;

    if (!timeRange || !activity) {
      return res.status(400).json({ error: 'timeRange and activity are required' });
    }

    const pairId = getUserPairId(req);
    const slotOwner = ownerRole || (req.user.role === 'learner' ? 'learner' : 'admin');

    const newSlot: TimetableItem = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      ownerRole: slotOwner,
      timeRange,
      startHour: Number(startHour) || 8,
      startMinute: Number(startMinute) || 0,
      endHour: Number(endHour) || 9,
      endMinute: Number(endMinute) || 0,
      activity,
      category: category || 'General',
      description: description || '',
      isStudySession: Boolean(isStudySession),
      pairId
    };

    db.timetable.push(newSlot);
    saveDb();

    res.status(201).json(newSlot);
  });

  app.delete('/api/timetable/:id', authenticateToken, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    db.timetable = db.timetable.filter(s => !(s.id === id && (s.pairId || 'default') === pairId));
    saveDb();
    res.json({ message: 'Timetable slot deleted' });
  });

  // Lessons Routes
  app.get('/api/lessons', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    let list = db.lessons.filter(l => (l.pairId || 'default') === pairId);
    if (list.length === 0) {
      const cloned = initialLessons.map(l => ({
        ...l,
        id: `${pairId}-${l.id}`,
        completed: false,
        completedAt: undefined,
        pairId
      }));
      db.lessons.push(...cloned);
      saveDb();
      list = cloned;
    }
    const { level } = req.query;
    if (level) {
      list = list.filter(l => l.level === level);
    }
    res.json(list);
  });

  app.patch('/api/lessons/:id/toggle', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const pairId = getUserPairId(req);
    const lesson = db.lessons.find(l => l.id === id && (l.pairId || 'default') === pairId);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lesson.completed = !lesson.completed;
    lesson.completedAt = lesson.completed ? new Date().toISOString() : undefined;
    saveDb();
    res.json(lesson);
  });

  // Stats Routes
  app.get('/api/stats/streak', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    res.json(getPairStreak(pairId));
  });

  app.get('/api/stats/combined', authenticateToken, (req: any, res) => {
    const pairId = getUserPairId(req);
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const pairTasks = db.tasks.filter(t => (t.pairId || 'default') === pairId);
    const pairLessons = db.lessons.filter(l => (l.pairId || 'default') === pairId);

    const adminTasks = pairTasks.filter(t => t.assignedTo === 'admin' && t.completed && t.date >= startOfWeekStr);
    const learnerTasks = pairTasks.filter(t => t.assignedTo === 'learner' && t.completed && t.date >= startOfWeekStr);

    const adminN4 = pairLessons.filter(l => l.level === 'N4' && l.completed).length;
    const learnerN5 = pairLessons.filter(l => l.level === 'N5' && l.completed).length;

    const totalTasks = pairTasks.filter(t => t.completed).length;
    const streakInfo = getPairStreak(pairId);

    const combined: CombinedStats = {
      adminCompletedTasksThisWeek: adminTasks.length,
      learnerCompletedTasksThisWeek: learnerTasks.length,
      adminN4LessonsCompleted: adminN4,
      learnerN5LessonsCompleted: learnerN5,
      learnerStreak: streakInfo.currentStreak,
      totalCombinedTasks: totalTasks
    };

    res.json(combined);
  });

  // Catch-all 404 handler — this is an API-only server now (the frontend is a
  // separate app), so any unmatched route is simply a missing API endpoint.
  app.use((req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
    console.log(`CORS allowed origin: ${process.env.FRONTEND_ORIGIN || '*'}`);
  });
}

startServer();
