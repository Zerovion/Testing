import React, { useState, useEffect } from 'react';
import { DisplayNames } from '../types';
import { Settings, User, Heart, Check, Moon, Sun, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  displayNames: DisplayNames;
  onSaveNames: (adminName: string, learnerName: string) => Promise<void>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  displayNames,
  onSaveNames,
  darkMode,
  onToggleDarkMode,
  onClose
}) => {
  const [adminName, setAdminName] = useState(displayNames.adminName || 'Aboli');
  const [learnerName, setLearnerName] = useState(displayNames.learnerName || 'Boyfriend');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (displayNames.adminName) setAdminName(displayNames.adminName);
    if (displayNames.learnerName) setLearnerName(displayNames.learnerName);
  }, [displayNames.adminName, displayNames.learnerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !learnerName.trim()) return;

    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveNames(adminName.trim(), learnerName.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to update names:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#322E2B] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-pink-100 dark:border-[#5D574D] shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-[#5D574D] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED]">
                Website Settings
              </h3>
              <p className="text-xs text-pink-600 dark:text-pink-300 font-semibold">
                Mutual Personalization & Theme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Display Name Mutual Editor Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-pink-50/50 dark:bg-pink-950/30 p-3.5 rounded-2xl border border-pink-100 dark:border-pink-900/40">
            <p className="text-xs text-[#3E3B39] dark:text-[#F5F2ED] font-medium flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
              <span>
                Both of you can change each other's display names! Changes synchronize across the website.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
              👩 Admin Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Aboli ❤️"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
              👨 Learner Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="e.g. Boyfriend / Nickname ❤️"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-pink-500 hover:bg-pink-600 transition-all shadow-md shadow-pink-500/20 active:scale-98 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Names Saved & Synchronized!</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <span>Save Display Names</span>
            )}
          </button>
        </form>

        {/* Theme Preferences */}
        <div className="pt-4 border-t border-pink-100 dark:border-[#5D574D] space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Appearance & Theme
          </label>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#2B2826] border border-slate-200/60 dark:border-[#5D574D]">
            <div className="flex items-center space-x-2">
              {darkMode ? <Moon className="w-4 h-4 text-pink-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-xs font-semibold text-[#3E3B39] dark:text-[#F5F2ED]">
                {darkMode ? 'Dark Theme (Soft Pink Accents)' : 'Light Theme (Soft Blush)'}
              </span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 hover:bg-pink-200 transition-all"
            >
              Toggle Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
