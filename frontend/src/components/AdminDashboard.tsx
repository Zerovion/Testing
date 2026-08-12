import React, { useState } from 'react';
import {
  Task,
  Surprise,
  EncouragementMessage,
  Reaction,
  CuteNote,
  VoiceNote,
  LessonProgress,
  TimetableItem,
  CombinedStats,
  TaskCategory,
  SurpriseType,
  UnlockConditionType
} from '../types';
import {
  Calendar,
  Plus,
  Trash2,
  Gift,
  Heart,
  MessageCircle,
  Play,
  CheckCircle2,
  Sparkles,
  Copy,
  Clock,
  Shield,
  Send,
  Eye,
  Lock,
  LockOpen,
  Mic,
  Star
} from 'lucide-react';
import { TimetableSection } from './TimetableSection';
import { OurJourneySection } from './OurJourneySection';

interface AdminDashboardProps {
  tasks: Task[];
  surprises: Surprise[];
  messages: EncouragementMessage[];
  reactions: Reaction[];
  cuteNotes: CuteNote[];
  voiceNotes: VoiceNote[];
  lessons: LessonProgress[];
  slots: TimetableItem[];
  stats: CombinedStats | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onCreateTask: (taskData: any) => Promise<void>;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onCopyRecurring: (sourceDate: string, targetDate: string) => Promise<void>;
  onCreateSurprise: (surpriseData: any) => Promise<void>;
  onDeleteSurprise: (id: string) => Promise<void>;
  onCreateMessage: (text: string) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onMarkVoiceNotePlayed: (id: string) => Promise<void>;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  adminName?: string;
  learnerName?: string;
  onCreateTimetableSlot?: (slot: Partial<TimetableItem>) => Promise<void>;
  onDeleteTimetableSlot?: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tasks,
  surprises,
  messages,
  reactions,
  cuteNotes,
  voiceNotes,
  lessons,
  slots,
  stats,
  selectedDate,
  onDateChange,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onCopyRecurring,
  onCreateSurprise,
  onDeleteSurprise,
  onCreateMessage,
  onDeleteMessage,
  onMarkVoiceNotePlayed,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  adminName = 'Aboli',
  learnerName = 'Boyfriend',
  onCreateTimetableSlot,
  onDeleteTimetableSlot
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'tasks' | 'surprises' | 'messages' | 'reactions' | 'timetable' | 'journey'>('tasks');
  const activeTab = (externalActiveTab as any) || internalActiveTab;
  const setActiveTab = (tab: any) => {
    setInternalActiveTab(tab);
    if (externalSetActiveTab) externalSetActiveTab(tab);
  };

  // Task Creation Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Japanese N5');
  const [taskAssignedTo, setTaskAssignedTo] = useState<'admin' | 'learner'>('learner');
  const [taskRequired, setTaskRequired] = useState(true);
  const [taskImportant, setTaskImportant] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Copy Recurring Tasks State
  const [copyTargetDate, setCopyTargetDate] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Surprise Creation Form State
  const [surpriseTitle, setSurpriseTitle] = useState('');
  const [surpriseType, setSurpriseType] = useState<SurpriseType>('sweet_message');
  const [conditionType, setConditionType] = useState<UnlockConditionType>('all_today_tasks');
  const [conditionValue, setConditionValue] = useState<string | number>('3');
  const [scheduledDate, setScheduledDate] = useState(selectedDate);
  const [surpriseMessage, setSurpriseMessage] = useState('');
  const [surprisePhotoUrl, setSurprisePhotoUrl] = useState('');
  const [surpriseBadgeName, setSurpriseBadgeName] = useState('');
  const [surpriseSongTitle, setSurpriseSongTitle] = useState('');
  const [isSubmittingSurprise, setIsSubmittingSurprise] = useState(false);

  // Encouragement Message State
  const [msgText, setMsgText] = useState('');

  // Voice Note Playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSubmittingTask(true);
    try {
      await onCreateTask({
        title: taskTitle.trim(),
        category: taskCategory,
        assignedTo: taskAssignedTo,
        date: selectedDate,
        requiredForDaily: taskRequired,
        important: taskImportant
      });
      setTaskTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleSurpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surpriseTitle.trim()) return;

    setIsSubmittingSurprise(true);
    try {
      await onCreateSurprise({
        title: surpriseTitle.trim(),
        type: surpriseType,
        conditionType,
        conditionValue,
        scheduledDate,
        content: {
          message: surpriseMessage.trim() || undefined,
          photoUrl: surprisePhotoUrl.trim() || undefined,
          badgeName: surpriseBadgeName.trim() || undefined,
          songTitle: surpriseSongTitle.trim() || undefined
        }
      });
      setSurpriseTitle('');
      setSurpriseMessage('');
      setSurprisePhotoUrl('');
      setSurpriseBadgeName('');
      setSurpriseSongTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSurprise(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    try {
      await onCreateMessage(msgText.trim());
      setMsgText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyTargetDate) return;
    try {
      await onCopyRecurring(selectedDate, copyTargetDate);
      setShowCopyModal(false);
      setCopyTargetDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const playVoiceNote = (vn: VoiceNote) => {
    const audio = new Audio(vn.audioData);
    setPlayingVoiceId(vn.id);
    audio.play();
    audio.onended = () => {
      setPlayingVoiceId(null);
      if (!vn.played) {
        onMarkVoiceNotePlayed(vn.id);
      }
    };
  };

  // Filter tasks by date & role
  const learnerTasks = tasks.filter((t) => t.assignedTo === 'learner');
  const adminTasks = tasks.filter((t) => t.assignedTo === 'admin');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Header Banner */}
      <div className="p-6 rounded-3xl bg-[#3E3B39] text-[#F5F2ED] border border-[#5D574D] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-[#FAF7F2] text-[#3E3B39]">
                <Shield className="w-4 h-4 text-[#A7C0A8]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9C5B2]">
                Admin Control Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F5F2ED]">
              Manage Learning, Tasks & Surprises ❤️
            </h1>
            <p className="text-xs text-[#D9C5B2] font-medium">
              Create tasks for boyfriend, track progress, create hidden surprises & view received messages.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-[#4A4744] p-2 rounded-2xl border border-[#5D574D] self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-[#A7C0A8] ml-1" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-[#F5F2ED] text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

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
          <CheckCircle2 className="w-4 h-4" />
          <span>Task Management</span>
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
          <span>Surprises & Rewards ({surprises.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'messages' || activeTab === 'reactions' || activeTab === 'notes'
              ? 'bg-[#A7C0A8] text-white shadow-xs'
              : 'text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-[#FAF7F2] dark:hover:bg-[#4A4744]'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-pink-500" />
          <span>Messages & Reactions ({messages.length + cuteNotes.length + voiceNotes.length})</span>
          {(cuteNotes.length > 0 || voiceNotes.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-[#D9C5B2] animate-ping"></span>
          )}
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

      {/* TAB 1: TASK MANAGEMENT */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Create Task Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Assign New Task
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign daily study tasks for your boyfriend or personal goals for yourself.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCopyModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:hover:bg-pink-900/60 dark:text-pink-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Date</span>
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Learn 15 new N5 vocabulary words"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign To
                  </label>
                  <select
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="learner">👨 Boyfriend (Learner)</option>
                    <option value="admin">👩 Me (Aboli)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Japanese N5">Japanese N5</option>
                    <option value="Japanese N4">Japanese N4</option>
                    <option value="Skills / Internship">Skills / Internship</option>
                    <option value="College Study">College Study</option>
                    <option value="Exercise">Exercise</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskRequired}
                      onChange={(e) => setTaskRequired(e.target.checked)}
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span>Required for Daily Completion & Surprise Unlock</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskImportant}
                      onChange={(e) => setTaskImportant(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Mark as Important ⭐</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-500/20 active:scale-98 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingTask ? 'Creating...' : 'Add Task'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Task Lists Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Boyfriend's Assigned Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>👨 Boyfriend's Tasks ({learnerTasks.length})</span>
                </h3>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full">
                  {learnerTasks.filter((t) => t.completed).length}/{learnerTasks.length} Done
                </span>
              </div>

              {learnerTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No tasks assigned for {selectedDate}. Use the form above to add some!
                </p>
              ) : (
                <div className="space-y-2">
                  {learnerTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-slate-300 hover:text-emerald-500 transition-colors"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              task.completed
                                ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950'
                                : ''
                            }`}
                          />
                        </button>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs font-bold ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.important && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.2 rounded font-semibold">
                              {task.category}
                            </span>
                            {task.requiredForDaily && (
                              <span className="text-pink-600 font-medium">• Required Daily</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin's Own Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span>👩 My Own Tasks ({adminTasks.length})</span>
                </h3>
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950 px-2.5 py-1 rounded-full">
                  {adminTasks.filter((t) => t.completed).length}/{adminTasks.length} Done
                </span>
              </div>

              {adminTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No personal tasks added for {selectedDate}.
                </p>
              ) : (
                <div className="space-y-2">
                  {adminTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-slate-300 hover:text-emerald-500 transition-colors"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              task.completed
                                ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950'
                                : ''
                            }`}
                          />
                        </button>

                        <div>
                          <span
                            className={`text-xs font-bold ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
                            {task.category}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SURPRISES & REWARDS */}
      {activeTab === 'surprises' && (
        <div className="space-y-6">
          {/* Create Surprise Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Gift className="w-5 h-5 text-pink-500" />
                <span>Create Hidden Surprise Reward</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surprises stay completely hidden & protected on server level until conditions are met!
              </p>
            </div>

            <form onSubmit={handleSurpriseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Surprise Title
                  </label>
                  <input
                    type="text"
                    required
                    value={surpriseTitle}
                    onChange={(e) => setSurpriseTitle(e.target.value)}
                    placeholder="e.g. Today's Sweet Love Note 🎁"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Surprise Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Surprise Type
                  </label>
                  <select
                    value={surpriseType}
                    onChange={(e) => setSurpriseType(e.target.value as SurpriseType)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="sweet_message">💌 Sweet Message / Love Note</option>
                    <option value="photo">🖼️ Special Photo / Meme</option>
                    <option value="song">🎵 Song Recommendation</option>
                    <option value="badge">🏆 Virtual Badge / Trophy</option>
                  </select>
                </div>

                {/* Unlock Condition */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unlock Condition
                  </label>
                  <select
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as UnlockConditionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all_today_tasks">Unlock when ALL today's tasks completed</option>
                    <option value="streak_days">Unlock when N days streak reached</option>
                    <option value="n5_lesson">Unlock when N5 Lesson X completed</option>
                    <option value="milestone">Unlock when N total N5 lessons completed</option>
                    <option value="scheduled_date">Unlock on/after specific date</option>
                  </select>
                </div>
              </div>

              {/* Dynamic condition input based on selection */}
              {(conditionType === 'streak_days' || conditionType === 'n5_lesson' || conditionType === 'milestone') && (
                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Value (e.g. 5 for 5-day streak or Lesson 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}

              {conditionType === 'scheduled_date' && (
                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Unlock Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sweet Message / Secret Note Content
                </label>
                <textarea
                  rows={2}
                  value={surpriseMessage}
                  onChange={(e) => setSurpriseMessage(e.target.value)}
                  placeholder="Type your loving message here..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Optional Photo URL or Badge Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {surpriseType === 'photo' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Photo URL (or Image link)
                    </label>
                    <input
                      type="url"
                      value={surprisePhotoUrl}
                      onChange={(e) => setSurprisePhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}

                {surpriseType === 'badge' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Name
                    </label>
                    <input
                      type="text"
                      value={surpriseBadgeName}
                      onChange={(e) => setSurpriseBadgeName(e.target.value)}
                      placeholder="e.g. N5 Master Samurai 🗡️"
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}

                {surpriseType === 'song' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Song Title & Artist
                    </label>
                    <input
                      type="text"
                      value={surpriseSongTitle}
                      onChange={(e) => setSurpriseSongTitle(e.target.value)}
                      placeholder="e.g. Sparkle — RADWIMPS"
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingSurprise}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-500/20 active:scale-98 transition-all"
                >
                  <Gift className="w-4 h-4" />
                  <span>{isSubmittingSurprise ? 'Creating...' : 'Create Hidden Surprise'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Surprises List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Active Surprises & Status Tracker
            </h3>

            {surprises.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No surprises created yet. Create one above!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surprises.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {s.unlocked ? (
                          <LockOpen className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-rose-500" />
                        )}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {s.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => onDeleteSurprise(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{s.content?.message || 'Secret content protected'}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-semibold">
                      <span className="text-pink-600 dark:text-pink-400">
                        {s.progressInfo || 'Status Active'}
                      </span>

                      <div className="flex items-center space-x-2">
                        {s.unlocked ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Unlocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Locked
                          </span>
                        )}

                        {s.viewed ? (
                          <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                            <Eye className="w-3 h-3" />
                            <span>Viewed</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Not viewed yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3 & 4: MESSAGES & HIS REACTIONS HUB */}
      {(activeTab === 'messages' || activeTab === 'reactions' || activeTab === 'notes') && (
        <div className="space-y-6">
          {/* Send Encouragement Messages Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Send Encouragement Messages</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Messages land directly in his dashboard under "💌 A Message For You" card.
              </p>
            </div>

            <form onSubmit={handleMessageSubmit} className="flex space-x-2">
              <input
                type="text"
                required
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="e.g. You can do it! I'm so proud of your progress 🥰"
                className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600 transition-colors flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>

            <div className="space-y-3 pt-4">
              <h3 className="font-bold text-xs uppercase text-slate-400">Active Encouragement Cards</h3>
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No messages sent yet.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/80 dark:bg-slate-800 border border-rose-200/60 dark:border-slate-700"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      "{m.text}"
                    </p>
                    <button
                      onClick={() => onDeleteMessage(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* His Reactions & Messages Received Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                <span>💬 His Reactions & Messages</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View reactions, Instagram-style cute notes & voice notes sent by your boyfriend!
              </p>
            </div>

            {/* Reactions Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400">Recent Emoji Reactions</h3>
              {reactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reactions received yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {reactions.map((r) => (
                    <div
                      key={r.id}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-sm font-bold"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cute Notes List */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase text-slate-400">💌 Cute Instagram-Style Notes</h3>
              {cuteNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No cute notes received yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cuteNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/60 border border-pink-200/80 dark:border-slate-700 space-y-1"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        "{n.text}"
                      </p>
                      <span className="block text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                        Received {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Notes Section */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
                <Mic className="w-4 h-4 text-rose-500" />
                <span>🎤 Voice Notes (Play Directly)</span>
              </h3>

              {voiceNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No voice notes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {voiceNotes.map((vn) => (
                    <div
                      key={vn.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => playVoiceNote(vn)}
                          className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              Voice Note ({vn.durationSeconds}s)
                            </span>
                            {!vn.played && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Sent at {new Date(vn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {playingVoiceId === vn.id && (
                        <span className="text-xs font-bold text-rose-500 animate-pulse">
                          Playing Audio...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TIMETABLE & ROUTINE SECTION */}
      {(activeTab === 'routine' || activeTab === 'timetable') && (
        <TimetableSection
          slots={slots}
          tasks={tasks}
          userRole="admin"
          adminName={adminName}
          learnerName={learnerName}
          onCreateSlot={onCreateTimetableSlot}
          onDeleteSlot={onDeleteTimetableSlot}
          onAddTaskToSlot={async (slot, title) => {
            await onCreateTask({
              title,
              category: slot.category,
              assignedTo: 'admin',
              date: selectedDate,
              timetableSlotId: slot.id
            });
          }}
          onToggleTask={onToggleTask}
        />
      )}

      {/* TAB 6: PROGRESS & OUR JOURNEY */}
      {(activeTab === 'progress' || activeTab === 'journey') && <OurJourneySection stats={stats} adminName={adminName} learnerName={learnerName} />}

      {/* Copy Tasks Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-pink-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Copy Tasks to Another Date
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copy all tasks from {selectedDate} to a future date.
            </p>

            <form onSubmit={handleCopySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={copyTargetDate}
                  onChange={(e) => setCopyTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700"
                >
                  Copy Tasks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
