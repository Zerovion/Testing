import React, { useState, useEffect, useCallback } from 'react';
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
  NotificationItem,
  DisplayNames,
  UserRole
} from './types';
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  loginApi,
  signupApi,
  getMeApi,
  getTasksApi,
  createTaskApi,
  toggleTaskApi,
  updateTaskApi,
  deleteTaskApi,
  copyRecurringTasksApi,
  getSurprisesApi,
  createSurpriseApi,
  markSurpriseViewedApi,
  deleteSurpriseApi,
  getMessagesApi,
  createMessageApi,
  deleteMessageApi,
  getReactionsApi,
  sendReactionApi,
  getCuteNotesApi,
  sendCuteNoteApi,
  getVoiceNotesApi,
  sendVoiceNoteApi,
  markVoiceNotePlayedApi,
  getLessonsApi,
  toggleLessonApi,
  getStreakApi,
  getCombinedStatsApi,
  getTimetableApi,
  createTimetableSlotApi,
  deleteTimetableSlotApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  getDisplayNamesApi,
  updateDisplayNamesApi
} from './lib/api';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { LearnerDashboard } from './components/LearnerDashboard';
import { SurpriseUnlockModal } from './components/SurpriseUnlockModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });

  // Selected Date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Data Collections State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [messages, setMessages] = useState<EncouragementMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cuteNotes, setCuteNotes] = useState<CuteNote[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ currentStreak: 5, milestonesUnlocked: [3, 5] });
  const [stats, setStats] = useState<CombinedStats | null>(null);
  const [slots, setSlots] = useState<TimetableItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [displayNames, setDisplayNames] = useState<DisplayNames>({ adminName: 'Aboli', learnerName: 'Boyfriend' });

  // Active Surprise Reveal Modal
  const [activeSurprise, setActiveSurprise] = useState<Surprise | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [darkMode]);

  // Load User Data
  const fetchAllData = useCallback(async () => {
    if (!getStoredToken()) return;

    try {
      const [
        tasksRes,
        surprisesRes,
        messagesRes,
        reactionsRes,
        cuteNotesRes,
        voiceNotesRes,
        lessonsRes,
        streakRes,
        statsRes,
        slotsRes,
        notifsRes,
        namesRes
      ] = await Promise.all([
        getTasksApi(selectedDate),
        getSurprisesApi(),
        getMessagesApi(),
        getReactionsApi(),
        getCuteNotesApi(),
        getVoiceNotesApi(),
        getLessonsApi(),
        getStreakApi(),
        getCombinedStatsApi(),
        getTimetableApi(),
        getNotificationsApi().catch(() => []),
        getDisplayNamesApi().catch(() => ({ adminName: 'Aboli', learnerName: 'Boyfriend' }))
      ]);

      setTasks(tasksRes);
      setSurprises(surprisesRes);
      setMessages(messagesRes);
      setReactions(reactionsRes);
      setCuteNotes(cuteNotesRes);
      setVoiceNotes(voiceNotesRes);
      setLessons(lessonsRes);
      setStreak(streakRes);
      setStats(statsRes);
      setSlots(slotsRes);
      setNotifications(notifsRes);
      if (namesRes) setDisplayNames(namesRes);
    } catch (err: any) {
      console.error('Data sync error:', err);
    }
  }, [selectedDate]);

  // Sync route path on client
  const syncRouteFromPath = useCallback((currentUser: User | null) => {
    const rawPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (!currentUser) {
      if (rawPath !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      return;
    }

    if (rawPath === '/login' || rawPath === '/' || rawPath === '/dashboard') {
      const target = currentUser.role === 'admin' ? '/admin' : '/learner';
      window.history.replaceState(null, '', target);
    } else if (rawPath === '/admin' || rawPath === '/learner') {
      // Role dashboard path
    } else if (['/tasks', '/surprises', '/messages', '/notes', '/love', '/reactions', '/routine', '/timetable', '/progress', '/lessons', '/journey'].includes(rawPath)) {
      const tab = rawPath.substring(1);
      if (tab === 'notes' || tab === 'love' || tab === 'reactions') setActiveTab('messages');
      else if (tab === 'timetable') setActiveTab('routine');
      else if (tab === 'lessons' || tab === 'journey') setActiveTab('progress');
      else setActiveTab(tab);
    } else if (rawPath === '/settings') {
      setIsSettingsOpen(true);
    }
  }, []);

  // Browser navigation history listener
  useEffect(() => {
    const handlePopState = () => {
      syncRouteFromPath(user);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, syncRouteFromPath]);

  // Check auth session on startup
  useEffect(() => {
    const initAuth = async () => {
      getDisplayNamesApi().then(setDisplayNames).catch(() => {});
      const token = getStoredToken();
      if (token) {
        try {
          const loggedUser = await getMeApi();
          setUser(loggedUser);
          syncRouteFromPath(loggedUser);
        } catch (err) {
          removeStoredToken();
          setUser(null);
          syncRouteFromPath(null);
        }
      } else {
        syncRouteFromPath(null);
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [syncRouteFromPath]);

  // Sync data when user logs in or changes date
  useEffect(() => {
    if (user) {
      fetchAllData();
      // Real-time polling every 8 seconds for live shared sync
      const interval = setInterval(fetchAllData, 8000);
      return () => clearInterval(interval);
    }
  }, [user, fetchAllData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (user) {
      window.history.pushState(null, '', `/${tab}`);
    }
  };

  // Login handler
  const handleLogin = async (uName: string, pWord: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginApi(uName, pWord);
      setUser(res.user);
      const targetPath = res.user.role === 'admin' ? '/admin' : '/learner';
      window.history.pushState(null, '', targetPath);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Signup handler
  const handleSignup = async (uName: string, pWord: string, name: string, role: UserRole, pairCode?: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await signupApi(uName, pWord, name, role, pairCode);
      setUser(res.user);
      const targetPath = res.user.role === 'admin' ? '/admin' : '/learner';
      window.history.pushState(null, '', targetPath);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    window.history.pushState(null, '', '/login');
  };

  const handleQuickSwitchUser = async (targetRole: string) => {
    setIsLoggingIn(true);
    try {
      const res = await loginApi(targetRole, 'password123');
      setUser(res.user);
      const targetPath = res.user.role === 'admin' ? '/admin' : '/learner';
      window.history.pushState(null, '', targetPath);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Notification Actions
  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationReadApi(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllNotificationsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
  };

  // Display Names Settings Action
  const handleSaveDisplayNames = async (adminName: string, learnerName: string) => {
    const updated = await updateDisplayNamesApi(adminName, learnerName);
    setDisplayNames(updated);
    await fetchAllData();
  };

  // Timetable Slot Actions
  const handleCreateTimetableSlot = async (slotData: Partial<TimetableItem>) => {
    await createTimetableSlotApi(slotData);
    await fetchAllData();
  };

  const handleDeleteTimetableSlot = async (id: string) => {
    await deleteTimetableSlotApi(id);
    await fetchAllData();
  };

  // Task Actions
  const handleCreateTask = async (taskData: any) => {
    await createTaskApi(taskData);
    await fetchAllData();
  };

  const handleToggleTask = async (id: string) => {
    await toggleTaskApi(id);
    await fetchAllData();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTaskApi(id);
    await fetchAllData();
  };

  const handleCopyRecurring = async (sourceDate: string, targetDate: string) => {
    await copyRecurringTasksApi(sourceDate, targetDate);
    await fetchAllData();
  };

  // Surprise Actions
  const handleCreateSurprise = async (surpriseData: any) => {
    await createSurpriseApi(surpriseData);
    await fetchAllData();
  };

  const handleDeleteSurprise = async (id: string) => {
    await deleteSurpriseApi(id);
    await fetchAllData();
  };

  const handleOpenSurprise = async (s: Surprise) => {
    setActiveSurprise(s);
    if (!s.viewed) {
      await markSurpriseViewedApi(s.id);
      await fetchAllData();
    }
  };

  // Message Actions
  const handleCreateMessage = async (text: string) => {
    await createMessageApi(text);
    await fetchAllData();
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteMessageApi(id);
    await fetchAllData();
  };

  // Reactions & Notes
  const handleSendReaction = async (emoji: string) => {
    await sendReactionApi(emoji);
    await fetchAllData();
  };

  const handleSendCuteNote = async (text: string) => {
    await sendCuteNoteApi(text);
    await fetchAllData();
  };

  const handleSendVoiceNote = async (audioData: string, durationSeconds: number) => {
    await sendVoiceNoteApi(audioData, durationSeconds);
    await fetchAllData();
  };

  const handleMarkVoiceNotePlayed = async (id: string) => {
    await markVoiceNotePlayedApi(id);
    await fetchAllData();
  };

  // Lesson Action
  const handleToggleLesson = async (id: string) => {
    await toggleLessonApi(id);
    await fetchAllData();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50/40 dark:bg-[#2B2826]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500 animate-spin border-4 border-white border-t-transparent shadow-lg shadow-pink-500/20"></div>
          <p className="text-xs font-bold text-pink-600 dark:text-pink-300">Loading Shared Study Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF8] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] font-sans transition-colors pb-16 md:pb-6">
      <Navbar
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        notifications={notifications}
        displayNames={displayNames}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {!user ? (
          <AuthScreen
            onLogin={handleLogin}
            onSignup={handleSignup}
            isLoading={isLoggingIn}
            error={authError}
            displayNames={displayNames}
          />
        ) : user.role === 'admin' ? (
          <AdminDashboard
            tasks={tasks}
            surprises={surprises}
            messages={messages}
            reactions={reactions}
            cuteNotes={cuteNotes}
            voiceNotes={voiceNotes}
            lessons={lessons}
            slots={slots}
            stats={stats}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onCreateTask={handleCreateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onCopyRecurring={handleCopyRecurring}
            onCreateSurprise={handleCreateSurprise}
            onDeleteSurprise={handleDeleteSurprise}
            onCreateMessage={handleCreateMessage}
            onDeleteMessage={handleDeleteMessage}
            onMarkVoiceNotePlayed={handleMarkVoiceNotePlayed}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            adminName={displayNames.adminName}
            learnerName={displayNames.learnerName}
            onCreateTimetableSlot={handleCreateTimetableSlot}
            onDeleteTimetableSlot={handleDeleteTimetableSlot}
          />
        ) : (
          <LearnerDashboard
            tasks={tasks}
            surprises={surprises}
            messages={messages}
            reactions={reactions}
            cuteNotes={cuteNotes}
            voiceNotes={voiceNotes}
            lessons={lessons}
            slots={slots}
            streak={streak}
            stats={stats}
            selectedDate={selectedDate}
            onToggleTask={handleToggleTask}
            onOpenSurprise={handleOpenSurprise}
            onSendReaction={handleSendReaction}
            onSendCuteNote={handleSendCuteNote}
            onSendVoiceNote={handleSendVoiceNote}
            onToggleLesson={handleToggleLesson}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            adminName={displayNames.adminName}
            learnerName={displayNames.learnerName}
            onAddTaskToSlot={async (slot, title) => {
              await handleCreateTask({
                title,
                category: slot.category,
                assignedTo: 'learner',
                date: selectedDate,
                requiredForDaily: true,
                timetableSlotId: slot.id
              });
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Bar Navigation */}
      {user && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          unreadCount={notifications.filter((n) => !n.read).length}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          displayNames={displayNames}
          onSaveNames={handleSaveDisplayNames}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Surprise Unlock Modal Popup */}
      {activeSurprise && (
        <SurpriseUnlockModal
          surprise={activeSurprise}
          onClose={() => setActiveSurprise(null)}
          onSendReaction={handleSendReaction}
          onSendCuteNote={handleSendCuteNote}
          onSendVoiceNote={handleSendVoiceNote}
          adminName={displayNames.adminName}
        />
      )}
    </div>
  );
}
