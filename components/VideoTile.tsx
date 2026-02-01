
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { MicOff, ShieldCheck, UserX, MicOff as MuteIcon } from 'lucide-react';

interface VideoTileProps {
  participant: User;
  compact?: boolean;
  viewerIsAdmin?: boolean;
  onKick?: (userId: string) => void;
  onMute?: (userId: string) => void;
}

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1',
  '#33FFF3', '#FFA833', '#8A2BE2', '#4169E1', '#00FA9A'
];

const VideoTile: React.FC<VideoTileProps> = ({ participant, compact, viewerIsAdmin, onKick, onMute }) => {
  const [volume, setVolume] = useState(0); 
  const animationRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const avatarColor = useMemo(() => {
    const hash = participant.nickname.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return COLORS[hash % COLORS.length];
  }, [participant.nickname]);

  // Воспроизведение и визуализация
  useEffect(() => {
    if (participant.stream && audioRef.current) {
      audioRef.current.srcObject = participant.stream;
      audioRef.current.play().catch(e => console.warn("Autoplay blocked or stream empty", e));

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(participant.stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const average = sum / dataArray.length;
          setVolume(average / 128);
          animationRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();

        return () => {
          cancelAnimationFrame(animationRef.current);
          audioContext.close();
        };
      } catch (e) {
        console.error("Visualizer error", e);
      }
    }
  }, [participant.stream]);

  const scale = 1 + (volume * 0.3);
  const glow = volume * 100;

  return (
    <div 
      className={`relative bg-card-custom rounded-[48px] border transition-all duration-200 group aspect-[1.5/1] w-full max-w-2xl mx-auto overflow-hidden`}
      style={{
        borderColor: volume > 0.05 ? '#8A2BE2' : 'rgba(255,255,255,0.1)',
        boxShadow: volume > 0.05 ? `0 0 ${glow}px rgba(138, 43, 226, 0.4)` : 'none'
      }}
    >
      {/* Скрытый плеер для голоса */}
      <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />

      <div className="w-full h-full flex items-center justify-center">
        <div 
          style={{ backgroundColor: avatarColor, transform: `scale(${scale})` }}
          className="w-32 h-32 rounded-full flex items-center justify-center text-white text-6xl font-black shadow-2xl transition-transform duration-75"
        >
          {participant.nickname.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="bg-black/80 backdrop-blur-3xl px-5 py-2.5 rounded-[20px] border border-white/10 flex items-center space-x-2">
          {participant.isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-[#8A2BE2]" />}
          <span className="text-xs font-black text-white uppercase tracking-widest">{participant.nickname}</span>
        </div>
        {!participant.isMicOn && (
          <div className="bg-red-500/20 text-red-500 p-2.5 rounded-2xl border border-red-500/20">
            <MicOff className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTile;
