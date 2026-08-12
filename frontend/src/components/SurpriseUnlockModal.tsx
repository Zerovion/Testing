import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Surprise } from '../types';
import { Heart, Gift, Sparkles, Send, Music, Award, Image, X } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

interface SurpriseUnlockModalProps {
  surprise: Surprise;
  onClose: () => void;
  onSendReaction: (emoji: string) => Promise<void>;
  onSendCuteNote: (text: string) => Promise<void>;
  onSendVoiceNote: (audioData: string, durationSeconds: number) => Promise<void>;
  adminName?: string;
}

export const SurpriseUnlockModal: React.FC<SurpriseUnlockModalProps> = ({
  surprise,
  onClose,
  onSendReaction,
  onSendCuteNote,
  onSendVoiceNote,
  adminName = 'Aboli'
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [cuteNoteText, setCuteNoteText] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [reactionSent, setReactionSent] = useState(false);
  const [noteSent, setNoteSent] = useState(false);

  useEffect(() => {
    // Fire festive confetti animation
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleEmojiClick = async (emoji: string) => {
    setSelectedEmoji(emoji);
    try {
      await onSendReaction(emoji);
      setReactionSent(true);
      setTimeout(() => setReactionSent(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuteNoteText.trim()) return;

    try {
      await onSendCuteNote(cuteNoteText.trim());
      setCuteNoteText('');
      setNoteSent(true);
      setTimeout(() => setNoteSent(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white dark:bg-[#3E3B39] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E4D9] dark:border-[#5D574D] shadow-2xl my-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8B7E66] hover:text-[#3E3B39] dark:hover:text-[#F5F2ED] bg-[#FAF7F2] dark:bg-[#4A4744] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A7C0A8] text-white shadow-sm animate-bounce">
            <Gift className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F5F2ED] text-[#8B7E66] dark:bg-[#4A4744] dark:text-[#D9C5B2] border border-[#E8E4D9]">
            🎉 YOU UNLOCKED A SURPRISE!
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED]">
            {surprise.title}
          </h2>
        </div>

        {/* Surprise Content Display */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#4A4744] border border-[#E8E4D9] dark:border-[#5D574D] space-y-4">
          {surprise.content?.message && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8B7E66] dark:text-[#D9C5B2]">
                💌 Message From {adminName}
              </span>
              <p className="text-sm sm:text-base font-medium text-[#3E3B39] dark:text-[#F5F2ED] italic leading-relaxed bg-white dark:bg-[#2B2826] p-4 rounded-xl border border-[#E8E4D9] dark:border-[#5D574D]">
                "{surprise.content.message}"
              </p>
            </div>
          )}

          {surprise.content?.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-pink-200 dark:border-slate-700">
              <img
                src={surprise.content.photoUrl}
                alt="Surprise photo"
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {surprise.content?.badgeName && (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-3xl">{surprise.content.badgeIcon || '🏆'}</span>
              <div>
                <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
                  Virtual Badge Unlocked
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {surprise.content.badgeName}
                </h4>
              </div>
            </div>
          )}

          {surprise.content?.songTitle && (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-400">
                  Song Recommendation 🎵
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {surprise.content.songTitle} {surprise.content.songArtist ? `— ${surprise.content.songArtist}` : ''}
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* Send Love Back Section */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>Send Love Back</span>
            </h3>
            {reactionSent && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                ❤️ Reaction Sent!
              </span>
            )}
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-around p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
            {['❤️', '🥰', '😘', '🫂', '🥳', '🥺'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className={`text-2xl hover:scale-125 transition-transform p-1.5 rounded-xl ${
                  selectedEmoji === emoji ? 'bg-pink-100 dark:bg-pink-900/60 scale-110' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Cute Note Form */}
          <form onSubmit={handleSendNote} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={cuteNoteText}
                onChange={(e) => setCuteNoteText(e.target.value)}
                placeholder="Send a cute note (e.g., I'm proud of you ❤️)"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={!cuteNoteText.trim()}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
            {noteSent && (
              <p className="text-xs text-emerald-600 font-medium">💌 Cute Note delivered to {adminName}!</p>
            )}
          </form>

          {/* Voice Note Trigger */}
          {!showVoiceRecorder ? (
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="w-full text-center text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline py-1"
            >
              🎤 Record & Send a Voice Message
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
  );
};
