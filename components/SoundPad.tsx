
import React from 'react';
import { SOUNDS } from '../constants';
import { X, Volume2 } from 'lucide-react';

interface SoundPadProps {
  onPlaySound: (url: string, label: string) => void;
  onClose: () => void;
}

const SoundPad: React.FC<SoundPadProps> = ({ onPlaySound, onClose }) => {
  const handleSoundClick = (url: string, label: string) => {
    onPlaySound(url, label);
  };

  return (
    <div className="bg-card-custom rounded-[32px] border border-white/10 p-8 shadow-3xl animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center space-x-3 text-gray-400">
          <Volume2 className="w-5 h-5 text-[#8A2BE2]" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Саундпад</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-[var(--text)] transition-colors bg-white/5 rounded-xl">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SOUNDS.map(sound => (
          <button
            key={sound.id}
            onClick={() => handleSoundClick(sound.url, sound.label)}
            className="flex items-center justify-center p-6 bg-white/5 hover:bg-[#8A2BE2] text-gray-300 hover:text-white rounded-[24px] border border-white/5 transition-all active:scale-95 font-black uppercase tracking-widest text-xs shadow-md"
          >
            <span className="mr-2">{sound.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SoundPad;
