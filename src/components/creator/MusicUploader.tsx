import React, { useRef, useState, useEffect } from 'react';
import { UploadedMusic } from '../../types';
import { 
  Music, 
  UploadCloud, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Trash2, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileAudio
} from 'lucide-react';

interface MusicUploaderProps {
  music: UploadedMusic | null;
  onMusicChange: (music: UploadedMusic | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_MUSIC_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const MusicUploader: React.FC<MusicUploaderProps> = ({
  music,
  onMusicChange,
  onNext,
  onBack,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and handle audio instance
  useEffect(() => {
    if (!music) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const audio = new Audio(music.url);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      if (music && !music.duration) {
        onMusicChange({ ...music, duration: audio.duration });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [music?.url]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate MP3 type
    const isMp3Mime = file.type === 'audio/mpeg' || file.type === 'audio/mp3';
    const isMp3Ext = file.name.toLowerCase().endsWith('.mp3');

    if (!isMp3Mime && !isMp3Ext) {
      setErrorMessage('Please upload an MP3 file.');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > MAX_MUSIC_SIZE_BYTES) {
      setErrorMessage('Maximum file size: 25 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

    onMusicChange({
      file,
      url,
      fileName: file.name,
      fileSizeFormatted: `${sizeInMB} MB`,
      isSample: false,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onMusicChange(null);
  };

  // Allow generating a clean test tone/track if creator is testing without an MP3 file on hand
  const handleGenerateSampleTrack = () => {
    setErrorMessage(null);
    const synthAudioUrl = generateGentleAmbientAudio();
    onMusicChange({
      url: synthAudioUrl,
      fileName: 'Alex_Birthday_Acoustic_Score.mp3',
      fileSizeFormatted: '3.4 MB',
      duration: 180,
      isSample: true,
    });
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleContinue = () => {
    setErrorMessage(null);
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 04 OF 06
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1 mb-2 [text-wrap:balance]">
          UPLOAD YOUR SOUNDTRACK
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed [text-wrap:balance]">
          No stock music libraries. Upload your own meaningful MP3 song — the track that defines your memories together.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-[#E50914] text-white text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,audio/mpeg,audio/mp3"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Zone (if no music uploaded yet) */}
      {!music ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all cursor-pointer mb-8 group ${
            dragActive
              ? 'border-[#E50914] bg-[#E50914]/10'
              : 'border-[#2E2E2E] bg-[#0E0E0E] hover:border-neutral-500 hover:bg-[#121212]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-[#2E2E2E] mx-auto flex items-center justify-center text-neutral-400 group-hover:text-[#E50914] group-hover:scale-110 transition-all mb-4">
            <Music className="w-7 h-7" />
          </div>

          <h3 className="font-cinzel text-xl font-bold text-white mb-2 tracking-wide">
            CHOOSE YOUR PERSONAL MP3
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-4">
            Drag and drop your audio file here, or click to browse.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-neutral-400 font-mono">
            <span className="text-[#E50914] font-semibold">MP3 ONLY</span>
            <span>·</span>
            <span>MAXIMUM FILE SIZE: 25 MB</span>
            <span>·</span>
            <span>ONE PERSONAL TRACK</span>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1C1C1C]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateSampleTrack();
              }}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              Don't have an MP3 file right now? Load a test acoustic ambient score
            </button>
          </div>
        </div>
      ) : (
        /* Preview Player UI */
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#242424]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#E50914]">
                  PREVIEWING SOUNDTRACK
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-[240px] sm:max-w-md">
                  {music.fileName}
                </h4>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  {music.fileSizeFormatted || 'Ready'} · Synchronized with premiere timeline
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Replace MP3"
                className="p-2 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                title="Remove MP3"
                className="p-2 rounded-lg bg-[#1C1C1C] hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulated Waveform Visualization */}
          <div className="h-12 bg-[#0A0A0A] border border-[#202020] rounded-xl px-4 py-2 flex items-center justify-between gap-1 mb-5 overflow-hidden">
            {Array.from({ length: 42 }).map((_, idx) => {
              const activeRatio = duration > 0 ? currentTime / duration : 0;
              const barRatio = idx / 42;
              const isPassed = barRatio <= activeRatio;
              const waveHeight = isPlaying
                ? 20 + Math.sin(idx * 0.5 + Date.now() * 0.005) * 60 + ((idx * 5) % 25)
                : 20 + ((idx * 9) % 55);

              return (
                <div
                  key={idx}
                  style={{ height: `${Math.min(100, Math.max(15, waveHeight))}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPassed ? 'bg-[#E50914]' : 'bg-[#292929]'
                  }`}
                />
              );
            })}
          </div>

          {/* Time & Seek Bar */}
          <div className="space-y-2 mb-6">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#242424] accent-[#E50914] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs font-mono text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls & Volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-[#E50914] hover:bg-[#c90711] text-white flex items-center justify-center transition-all shadow-lg shadow-[#E50914]/30 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              <span className="text-xs font-medium text-neutral-300">
                {isPlaying ? 'Soundtrack Playing' : 'Click to Preview'}
              </span>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 sm:w-28 h-1.5 bg-[#262626] accent-[#E50914] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-6 border-t border-[#242424] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141414] border border-[#2A2A2A] rounded-xl hover:bg-[#1C1C1C] transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Story Curation</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#E50914] hover:bg-[#c90711] rounded-xl transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 cursor-pointer flex items-center gap-2"
        >
          <span>Continue to Customize</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Generates gentle synthetic ambient harmonic chords encoded into a clean WAV/Data URI for test audio
function generateGentleAmbientAudio(): string {
  try {
    const sampleRate = 22050;
    const durationSec = 15;
    const totalSamples = sampleRate * durationSec;
    const audioBuffer = new Float32Array(totalSamples);

    // Warm peaceful chord frequencies (C major 9: C3, G3, E4, B4, D5)
    const freqs = [130.81, 196.0, 329.63, 493.88, 587.33];

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      for (let f = 0; f < freqs.length; f++) {
        // Slow pulsing amplitude
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t + f);
        sample += Math.sin(2 * Math.PI * freqs[f] * t) * 0.15 * lfo;
      }
      // Gentle fade in / out
      const envelope = Math.min(1, t / 1.5) * Math.min(1, (durationSec - t) / 1.5);
      audioBuffer[i] = sample * envelope;
    }

    // Convert to 16-bit PCM WAV
    const wavBytes = encodeWAV(audioBuffer, sampleRate);
    const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    return '';
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write the PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
