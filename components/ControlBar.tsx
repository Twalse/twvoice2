
import React from 'react';
import { 
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  Monitor, MessageSquare, Music, Circle 
} from 'lucide-react';

interface ControlBarProps {
  isMicOn: boolean;
  isCamOn: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleDeafened: () => void;
  onToggleScreen: () => void;
  onToggleChat: () => void;
  onToggleSoundPad: () => void;
  onTogglePanel: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  isMicOn, isCamOn, isDeafened, isScreenSharing,
  onToggleMic, onToggleCam, onToggleDeafened, onToggleScreen, onToggleChat, onToggleSoundPad, onTogglePanel
}) => {
  return (
    <div className="flex items-center space-x-4 bg-[#1c1c21]/95 backdrop-blur-3xl px-6 py-4 rounded-[32px] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] pointer-events-auto">
      <div className="flex items-center space-x-2 border-r border-white/10 pr-4">
        <button 
          onClick={onToggleMic}
          className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${isMicOn ? 'bg-[#4169E1] text-white shadow-lg shadow-[#4169E1]/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button 
          onClick={onToggleCam}
          className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${isCamOn ? 'bg-[#4169E1] text-white shadow-lg shadow-[#4169E1]/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button 
          onClick={onToggleDeafened}
          className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${!isDeafened ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'}`}
        >
          {!isDeafened ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
        <button 
          onClick={onToggleScreen}
          className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${isScreenSharing ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button 
          onClick={onToggleSoundPad}
          className="p-4 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          <Music className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleChat}
          className="p-4 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={onTogglePanel}
          className="p-4 bg-gray-800 text-[#8A2BE2] hover:bg-[#8A2BE2] hover:text-white rounded-2xl transition-all hover:scale-110 active:scale-90"
          title="Скрыть панель"
        >
          <Circle className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
