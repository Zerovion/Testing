import React, { useState } from 'react';
import {
  Task,
  Surprise,
  EncouragementMessage,
  LessonProgress,
  StreakInfo,
  CombinedStats,
  Reaction,
  CuteNote,
  VoiceNote,
  TimetableItem
} from '../types';
import {
  CheckCircle2,
  Gift,
  Flame,
  BookOpen,
  Heart,
  Send,
  Lock,
  Sparkles,
  Award,
  ChevronRight,
  Smile,
  Mic,
  Star,
  Clock,
  MessageSquare
} from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { OurJourneySection } from './OurJourneySection';
import { TimetableSection } from './TimetableSection';

interface LearnerDashboardProps {
  tasks: Task[];
  surprises: Surprise[];
  messages: EncouragementMessage[];
  reactions?: Reaction[];
  cuteNotes?: CuteNote[];
  voiceNotes?: VoiceNote[];
  lessons: LessonProgress[];
  slots?: TimetableItem[];
  streak: StreakInfo;
  stats: CombinedStats | null;
  selectedDate: string;
  onToggleTask: (id: string) => Promise<void>;
  onOpenSurprise: (surprise: Surprise) => void;
  onSendReaction: (emoji: string) => Promise<void>;
  onSendCuteNote: (text: string) => Promise<void>;
  onSendVoiceNote: (audioData: string, durationSeconds: number) => Promise<void>;
  onToggleLesson: (id: string) => Promise<void>;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  adminName?: string;
  learnerName?: string;
  onAddTaskToSlot?: (slot: TimetableItem, title: string) => Promise<void>;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  tasks,
  surprises,
  messages,
  reactions = [],
  cuteNotes = [],
  voiceNotes = [],
  lessons,
  slots = [],
  streak,
  stats,
  selectedDate,
  onToggleTask,
  onOpenSurprise,
  onSendReaction,
  onSendCuteNote,
  onSendVoiceNote,
  onToggleLesson,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  adminName = 'Aboli',
  learnerName = 'Boyfriend',
  onAddTaskToSlot
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'tasks' | 'surprises' | 'lessons' | 'love' | 'journey'>('tasks');
  const activeTab = (externalActiveTab as any) || internalActiveTab;
  const setActiveTab = (tab: any) => {
    setInternalActiveTab(tab);
    if (externalSetActiveTab) externalSetActiveTab(tab);
  };
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [cuteNoteText, setCuteNoteText] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [reactionSuccess, setReactionSuccess] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Filter N5 tasks assigned to Learner for today
  const learnerTasksToday = tasks.filter((t) => t.assignedTo === 'learner');
  const reqTasks = learnerTasksToday.filter((t) => t.requiredForDaily);
  const completedReqCount = reqTasks.filter((t) => t.completed).length;
  const totalReqCount = reqTasks.length;
  const progressPercent = totalReqCount > 0 ? Math.round((completedReqCount / totalReqCount) * 100) : 0;

  const n5Lessons = lessons.filter((l) => l.level === 'N5');

  const handleQuickEmoji = async (emoji: string) => {
    setSelectedEmoji(emoji);
    try {
      await onSendReaction(emoji);
      setReactionSuccess(true);
      setTimeout(() => setReactionSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCuteNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuteNoteText.trim()) return;

    try {
      await onSendCuteNote(cuteNoteText.trim());
      setCuteNoteText('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Today's Progress */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#3E3B39] text-[#F5F2ED] border border-[#5D574D] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF7F2] text-[#3E3B39] border border-[#E8E4D9] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
              <span>Japanese N5 Learner Space</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F5F2ED]">
              Konnichiwa! Ready to learn Japanese today? 🎌
            </h1>

            {/* Streak & Completion Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] text-[#3E3B39] font-bold text-xs border border-[#E8E4D9] shadow-xs">
                <Flame className="w-4 h-4 fill-current text-amber-600" />
                <span>Current Streak: {streak.currentStreak} Days 🔥</span>
              </div>

              <div className="text-xs font-bold text-[#D9C5B2]">
                Today's Progress: {completedReqCount}/{totalReqCount} Tasks Completed ({progressPercent}%)
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full max-w-lg bg-[#4A4744] rounded-full h-3 p-0.5 overflow-hidden border border-[#5D574D]">
              <div
                className="bg-[#A7C0A8] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Surprise Widget in Header */}
          <div className="p-4 rounded-2xl bg-[#4A4744] border border-[#5D574D] text-center space-y-2 self-start md:self-auto min-w-[200px]">
            <Gift className="w-8 h-8 text-[#D9C5B2] mx-auto animate-bounce" />
            <span className="block text-xs font-bold text-[#F5F2ED]">
              {progressPercent === 100 ? '🎉 Surprise Ready!' : '🎁 Surprise Locked'}
            </span>
            <span className="block text-[10px] text-[#D9C5B2]">
              {progressPercent === 100
                ? 'Complete all tasks to reveal!'
                : `${totalReqCount - completedReqCount} task(s) remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Encouragement Message Banner */}
      {messages.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#FAF7F2] dark:bg-[#4A4744] border border-[#E8E4D9] dark:border-[#5D574D] flex items-start space-x-3 shadow-xs">
          <div className="p-2 rounded-2xl bg-[#3E3B39] text-[#F5F2ED] mt-0.5">
            <Heart className="w-5 h-5 text-[#A7C0A8] fill-current animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E66] dark:text-[#D9C5B2]">
              💌 A Message For You From Aboli
            </span>
            <p className="text-sm font-bold text-[#3E3B39] dark:text-[#F5F2ED] italic">
              "{messages[0].text}"
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 p-1.5 rounded-2xl bg-white dark:bg-[#3E3B39] border border-[#E8E4D9] dark:border-[#5D574D] shadow-xs">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'tasks'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Today's N5 Tasks ({learnerTasksToday.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surprises')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'surprises'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Surprises ({surprises.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'lessons'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>N5 Lessons ({n5Lessons.filter((l) => l.completed).length}/25)</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'messages' || activeTab === 'love' || activeTab === 'notes'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Messages & Send Love ❤️</span>
        </button>

        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'routine' || activeTab === 'timetable'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Routine & Timetable ⏰</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'progress' || activeTab === 'journey'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Progress & Journey 📊</span>
        </button>
      </div>

      {/* TAB 1: TODAY'S N5 TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                📚 Today's Japanese N5 Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tick tasks as you complete them. Progress updates live for both of us!
              </p>
            </div>

            <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
              {completedReqCount}/{totalReqCount} Done
            </span>
          </div>

          {learnerTasksToday.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">
              No tasks assigned for today yet. Check back soon or relax! ❤️
            </p>
          ) : (
            <div className="space-y-3">
              {learnerTasksToday.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <CheckCircle2
                      className={`w-6 h-6 flex-shrink-0 transition-transform ${
                        task.completed
                          ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950 scale-110'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-bold ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.important && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded font-bold">
                          {task.category}
                        </span>
                        {task.requiredForDaily && (
                          <span className="text-pink-600 dark:text-pink-400 font-semibold">
                            • Required for Surprise
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SURPRISES WAITING */}
      {activeTab === 'surprises' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <span>Surprises Waiting For You</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete your daily tasks to unlock special notes, photos, and rewards!
            </p>
          </div>

          {surprises.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">
              No surprises created for today yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surprises.map((s) => (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    s.unlocked
                      ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 border-transparent'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {s.unlocked ? (
                          <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                        ) : (
                          <Lock className="w-5 h-5 text-rose-500" />
                        )}
                        <h3 className={`font-extrabold text-base ${s.unlocked ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {s.title}
                        </h3>
                      </div>

                      <p className={`text-xs ${s.unlocked ? 'text-pink-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {s.progressInfo || 'Complete condition to unlock!'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20 dark:border-slate-700 flex justify-end">
                    {s.unlocked ? (
                      <button
                        onClick={() => onOpenSurprise(s)}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-white text-pink-600 hover:bg-pink-50 shadow-sm transition-all"
                      >
                        🎉 Reveal Surprise!
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        🔒 Complete Tasks to Unlock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: N5 LESSONS PROGRESS */}
      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-indigo-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                🗾 Japanese N5 Lessons Tracker (1 to 25)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check off N5 lessons as you complete them in textbook or study sessions!
              </p>
            </div>

            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
              {n5Lessons.filter((l) => l.completed).length}/25 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {n5Lessons.map((l) => (
              <div
                key={l.id}
                onClick={() => onToggleLesson(l.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  l.completed
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      l.completed
                        ? 'text-indigo-600 fill-indigo-100 dark:fill-indigo-950'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={`text-xs font-bold ${l.completed ? 'text-indigo-900 dark:text-indigo-200 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                    {l.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MESSAGES & SEND LOVE BACK */}
      {(activeTab === 'messages' || activeTab === 'love' || activeTab === 'notes') && (
        <div className="space-y-6">
          {/* Active Encouragement Messages from Aboli */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                <span>💌 Encouragement Messages From Aboli ({messages.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Messages and notes sent by Aboli to encourage your study journey!
              </p>
            </div>

            {messages.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                No active encouragement messages yet from Aboli. Send her love below!
              </p>
            ) : (
              <div className="space-y-2.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 to-rose-50/80 dark:from-slate-800 dark:to-slate-800/80 border border-pink-200/80 dark:border-slate-700 shadow-2xs space-y-1"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 italic">
                      "{m.text}"
                    </p>
                    <span className="block text-[10px] text-pink-600 dark:text-pink-400 font-semibold">
                      From Aboli • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send Love Back Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Send Love Back To Aboli</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send emoji reactions, cute Instagram-style notes, or record a voice note!
              </p>
            </div>

            {/* Quick Reaction Emojis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Quick Reactions</span>
                {reactionSuccess && (
                  <span className="text-xs font-bold text-emerald-600">❤️ Reaction Sent!</span>
                )}
              </div>
              <div className="flex items-center justify-around p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                {['❤️', '🥰', '😘', '🫂', '🥳', '🥺'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleQuickEmoji(emoji)}
                    className={`text-3xl hover:scale-125 transition-transform p-2 rounded-xl ${
                      selectedEmoji === emoji ? 'bg-pink-100 dark:bg-pink-900/60 scale-110' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Cute Note Input */}
            <form onSubmit={handleCuteNoteSubmit} className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400">
                💌 Cute Instagram Note
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={cuteNoteText}
                  onChange={(e) => setCuteNoteText(e.target.value)}
                  placeholder="e.g. Working hard on N5 Lesson 4! Miss you 🥺❤️"
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={!cuteNoteText.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Note</span>
                </button>
              </div>
              {noteSuccess && (
                <p className="text-xs text-emerald-600 font-medium">💌 Note delivered to {adminName || 'Admin'}!</p>
              )}
            </form>

            {/* Voice Recorder Widget */}
            <div className="pt-2">
              {!showVoiceRecorder ? (
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-200/60 dark:border-slate-700"
                >
                  <Mic className="w-4 h-4" />
                  <span>🎤 Record & Send Voice Note (Instagram DM Style)</span>
                </button>
              ) : (
                <VoiceRecorder
                  onSendVoiceNote={onSendVoiceNote}
                  onClose={() => setShowVoiceRecorder(false)}
                  adminName={adminName}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TIMETABLE / ROUTINE SECTION */}
      {(activeTab === 'routine' || activeTab === 'timetable') && (
        <TimetableSection
          slots={slots}
          tasks={tasks}
          userRole="learner"
          adminName={adminName}
          learnerName={learnerName}
          onAddTaskToSlot={onAddTaskToSlot}
          onToggleTask={onToggleTask}
        />
      )}

      {/* TAB 6: PROGRESS / OUR JOURNEY */}
      {(activeTab === 'progress' || activeTab === 'journey') && <OurJourneySection stats={stats} adminName={adminName} learnerName={learnerName} />}
    </div>
  );
};
