import React, { useState } from 'react';
import { Heart, Shield, Sparkles, Lock, User, ArrowRight, Gift, Calendar, CheckCircle2, UserPlus, KeyRound, UserCheck } from 'lucide-react';
import { DisplayNames, UserRole } from '../types';

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSignup?: (username: string, password: string, name: string, role: UserRole, pairCode?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  displayNames?: DisplayNames;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup, isLoading, error, displayNames }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [pairCode, setPairCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const adminName = displayNames?.adminName || 'Aboli';
  const learnerName = displayNames?.learnerName || 'Boyfriend';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim()) {
      setLocalError('Please enter a username');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter a password');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setLocalError('Please enter your full or display name');
        return;
      }
      if (username.trim().length < 3) {
        setLocalError('Username must be at least 3 characters');
        return;
      }
      if (password.length < 4) {
        setLocalError('Password must be at least 4 characters');
        return;
      }
      if (onSignup) {
        await onSignup(username.trim(), password, fullName.trim(), selectedRole, pairCode.trim());
      }
    } else {
      await onLogin(username.trim(), password);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'learner') => {
    if (role === 'admin') {
      onLogin('admin', 'password123');
    } else {
      onLogin('learner', 'password123');
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-pink-50/40 dark:bg-[#2B2826]">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#322E2B] p-8 rounded-3xl border border-pink-100 dark:border-[#5D574D] shadow-xl shadow-pink-500/5">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/25 mb-4">
            <Heart className="w-8 h-8 fill-current animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED] tracking-tight">
            Study & Progress
          </h2>
          <p className="mt-1 text-xs font-bold text-pink-600 dark:text-pink-300">
            {adminName} & {learnerName}'s Connected Space ❤️
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-2xl bg-pink-50 dark:bg-[#2B2826] p-1 border border-pink-100 dark:border-[#5D574D]">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setLocalError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isSignUp
                ? 'bg-white dark:bg-[#322E2B] text-pink-600 dark:text-pink-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setLocalError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isSignUp
                ? 'bg-white dark:bg-[#322E2B] text-pink-600 dark:text-pink-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {!isSignUp && (
          <div className="space-y-3 pt-1">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">
              ⚡ Quick Account Access
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                id="quick-login-admin-btn"
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-all shadow-md shadow-pink-500/20 active:scale-98 disabled:opacity-50"
              >
                <Shield className="w-4 h-4 text-white" />
                <span>{adminName} (Admin)</span>
              </button>

              <button
                id="quick-login-learner-btn"
                type="button"
                onClick={() => handleQuickLogin('learner')}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-rose-400 text-white font-bold text-xs hover:bg-rose-500 transition-all shadow-md shadow-rose-400/20 active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{learnerName} (Learner)</span>
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pink-100 dark:border-[#5D574D]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white dark:bg-[#322E2B] px-3 text-pink-400 font-bold">
                  Or Enter Credentials
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {activeError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {activeError}
            </div>
          )}

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('learner')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedRole === 'learner'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    🧑🎓 Learner
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedRole === 'admin'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    👩💼 Admin
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isSignUp ? "choose a username" : "admin or learner"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1 flex items-center justify-between">
                <span>Couple Space Code (Optional)</span>
                <span className="text-[10px] text-pink-500">e.g. LOVE2026</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="signup-paircode-input"
                  type="text"
                  value={pairCode}
                  onChange={(e) => setPairCode(e.target.value)}
                  placeholder="e.g. LOVE2026 to join shared space"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter 'LOVE2026' to connect with {adminName} & {learnerName}'s space, or leave blank to start a new private pair space.
              </p>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-pink-500 hover:bg-pink-600 transition-all shadow-md shadow-pink-500/20 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>{isSignUp ? 'Creating account...' : 'Logging in...'}</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account & Start' : 'Sign In'}</span>
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Features summary */}
        <div className="pt-4 border-t border-pink-100 dark:border-[#5D574D]">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-pink-700 dark:text-pink-300 font-bold">
            <div className="flex flex-col items-center p-2 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40">
              <Gift className="w-4 h-4 text-pink-500 mb-1" />
              <span>Surprises</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40">
              <Calendar className="w-4 h-4 text-pink-500 mb-1" />
              <span>Routine</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40">
              <CheckCircle2 className="w-4 h-4 text-pink-500 mb-1" />
              <span>Live Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
