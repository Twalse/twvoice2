
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
  '#33FFF3', '#FFA833', '#8A2BE2', '#4169E1', '#00FA9A',
  '#FFD700', '#FF4500', '#DA70D6', '#00CED1', '#7FFF00'
];

const VideoTile: React.FC<VideoTileProps> = ({ participant, compact, viewerIsAdmin, onKick, onMute }) => {
  const [volume, setVolume] = useState(0); 
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const avatarColor = useMemo(() => {
    const hash = participant.nickname.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return COLORS[hash % COLORS.length];
  }, [participant.nickname]);

  useEffect(() => {
    if (!participant.isMicOn || !participant.isOnline) {
      setVolume(0);
      return;
    }

    if (participant.stream) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(participant.stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4; // Чуть меньше сглаживания в самом анализаторе
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        const updateRealVolume = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          
          // ПОВЫШЕННАЯ ЧУВСТВИТЕЛЬНОСТЬ: делим на 15 вместо 45
          const normalized = Math.min(1, average / 15); 
          // БОЛЕЕ БЫСТРАЯ РЕАКЦИЯ: коэффициент 0.7 вместо 0.5
          setVolume(prev => prev + (normalized - prev) * 0.7); 
          
          animationRef.current = requestAnimationFrame(updateRealVolume);
        };

        animationRef.current = requestAnimationFrame(updateRealVolume);
        
        return () => {
          cancelAnimationFrame(animationRef.current);
          if (audioContext.state !== 'closed') audioContext.close();
        };
      } catch (e) {
        console.error("Audio visualization failed", e);
      }
    } else {
      let currentVol = 0;
      let targetVol = 0;
      let lastUpdate = 0;

      const updateSimulatedVolume = (time: number) => {
        if (time - lastUpdate > 50) { // Симуляция тоже стала быстрее
          if (Math.random() > 0.7) {
            targetVol = Math.random() * 0.9;
          } else if (Math.random() > 0.4) {
            targetVol *= 0.6;
          } else {
            targetVol = 0;
          }
          lastUpdate = time;
        }

        currentVol += (targetVol - currentVol) * 0.35;
        setVolume(Math.max(0, currentVol));
        animationRef.current = requestAnimationFrame(updateSimulatedVolume);
      };

      animationRef.current = requestAnimationFrame(updateSimulatedVolume);
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [participant.isMicOn, participant.isOnline, participant.stream]);

  // Усиление визуальных эффектов
  const glowIntensity = volume * 180;
  const scale = 1 + (volume * 0.35);
  const borderOpacity = Math.min(1, volume * 3.5 + 0.2);
  const borderWidth = volume > 0.02 ? Math.max(3, volume * 18) : (participant.isMicOn ? 2 : 1);

  return (
    <div 
      className={`
        relative bg-card-custom rounded-[48px] border transition-all duration-200 group shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
        ${compact ? 'w-full aspect-[1.5/1] mb-4' : 'w-full aspect-[1.5/1] max-w-2xl mx-auto'}
      `}
      style={{
        borderColor: participant.isMicOn ? (volume > 0.02 ? `rgba(138, 43, 226, ${borderOpacity})` : 'rgba(138, 43, 226, 0.3)') : 'var(--border)',
        borderWidth: `${borderWidth}px`,
        boxShadow: participant.isMicOn && volume > 0.02 ? `0 0 ${glowIntensity}px rgba(138, 43, 226, ${Math.min(1, volume * 1.5)})` : undefined
      }}
    >
      {/* ADMIN PANEL ON HOVER */}
      {viewerIsAdmin && !participant.isAdmin && participant.id !== '1' && (
        <div className="absolute top-6 right-6 z-50 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <button 
             onClick={(e) => { e.stopPropagation(); onMute?.(participant.id); }}
             className="bg-black/70 backdrop-blur-xl border border-white/10 hover:bg-orange-500 p-3 rounded-2xl text-white transition-all active:scale-90 flex items-center space-x-2 shadow-2xl"
             title="Замутить участника"
           >
             <MuteIcon className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase">Замутить</span>
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onKick?.(participant.id); }}
             className="bg-black/70 backdrop-blur-xl border border-white/10 hover:bg-red-500 p-3 rounded-2xl text-white transition-all active:scale-90 flex items-center space-x-2 shadow-2xl"
             title="Выгнать участника"
           >
             <UserX className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase">Выгнать</span>
           </button>
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-transparent to-black/5 rounded-[48px] overflow-hidden">
        {!participant.isCamOn ? (
          <div className="relative group/avatar">
            <div 
              style={{ 
                backgroundColor: avatarColor,
                transform: `scale(${scale})`,
                boxShadow: volume > 0.05 ? `0 0 ${volume * 120}px ${avatarColor}aa` : 'none'
              }}
              className={`
                  ${compact ? 'w-16 h-16' : 'w-32 h-32'} 
                  rounded-full flex items-center justify-center text-white font-black animate-pop border-4 border-white/5
                  transition-all duration-75
              `}
            >
              <span className={compact ? 'text-2xl' : 'text-6xl'}>
                {participant.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-[48px]">
             <div className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-3 opacity-20">
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white">КАМЕРА ВКЛЮЧЕНА</span>
             </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <div className="bg-black/80 backdrop-blur-3xl px-5 py-2.5 rounded-[20px] border border-white/10 shadow-2xl flex items-center space-x-2">
          {participant.isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-[#8A2BE2]" />}
          <span className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[120px]">
            {participant.nickname} {participant.id === '1' ? ' (ВЫ)' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!participant.isMicOn && (
            <div className="bg-red-500/30 text-red-400 p-2.5 rounded-2xl border border-red-500/30 shadow-2xl backdrop-blur-xl">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div 
        className={`absolute inset-0 border-[4px] rounded-[48px] pointer-events-none transition-all duration-75`}
        style={{ 
          borderColor: '#8A2BE2', 
          opacity: volume * 2.2,
          boxShadow: `inset 0 0 ${volume * 100}px rgba(138, 43, 226, 0.8)`
        }}
      ></div>
    </div>
  );
};

export default VideoTile;
