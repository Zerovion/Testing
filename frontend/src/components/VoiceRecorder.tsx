import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Send, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoiceNote: (audioData: string, durationSeconds: number) => Promise<void>;
  onClose?: () => void;
  adminName?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoiceNote, onClose, adminName = 'Admin' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('Microphone access denied or not available. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = async () => {
    if (!audioBase64) return;
    setIsSending(true);
    try {
      await onSendVoiceNote(audioBase64, recordingTime || 1);
      setAudioUrl(null);
      setAudioBase64(null);
      setRecordingTime(0);
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg('Failed to send voice note. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingTime(0);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#4A4744] border border-[#E8E4D9] dark:border-[#5D574D] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#F5F2ED] text-[#8B7E66] border border-[#E8E4D9]">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
            🎤 Voice Note (Instagram Style)
          </span>
        </div>
        {isRecording && (
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Recording {formatTime(recordingTime)}</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
      )}

      {!isRecording && !audioUrl && (
        <button
          id="start-voice-record-btn"
          type="button"
          onClick={startRecording}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#3E3B39] hover:bg-[#4A4744] transition-all shadow-sm active:scale-98"
        >
          <Mic className="w-4 h-4 text-[#A7C0A8]" />
          <span>Hold / Tap to Record Voice Note</span>
        </button>
      )}

      {isRecording && (
        <div className="flex items-center justify-between bg-white dark:bg-[#2B2826] p-3 rounded-xl border border-[#E8E4D9] dark:border-[#5D574D]">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-6 bg-[#A7C0A8] rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-8 bg-[#A7C0A8] rounded-full animate-bounce delay-150"></div>
            <div className="w-1.5 h-4 bg-[#A7C0A8] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-7 bg-[#A7C0A8] rounded-full animate-bounce delay-200"></div>
          </div>
          <button
            id="stop-voice-record-btn"
            type="button"
            onClick={stopRecording}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-white dark:bg-[#2B2826] p-3 rounded-xl border border-[#E8E4D9] dark:border-[#5D574D]">
            <button
              id="play-voice-preview-btn"
              type="button"
              onClick={togglePlayback}
              className="p-2 rounded-lg bg-[#F5F2ED] text-[#8B7E66] hover:bg-[#E8E4D9] transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <span className="text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
              Voice Note ({formatTime(recordingTime)})
            </span>
            <div className="flex items-center space-x-2">
              <button
                id="discard-voice-btn"
                type="button"
                onClick={handleDiscard}
                className="p-1.5 rounded-lg text-[#8B7E66] hover:text-rose-500 transition-colors"
                title="Discard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            id="send-voice-note-btn"
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl font-semibold text-xs text-white bg-[#A7C0A8] hover:bg-[#8FA690] transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Voice Note to {adminName} ❤️</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
