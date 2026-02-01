
import React from 'react';
import { User } from '../types';
import { Crown, UserPlus } from 'lucide-react';

interface ParticipantsSidebarProps {
  participants: User[];
  currentUserId: string;
  roomCode: string;
}

const ParticipantsSidebar: React.FC<ParticipantsSidebarProps> = ({ participants, currentUserId, roomCode }) => {
  const copyRoomId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomCode);
    alert('ID комнаты скопирован!');
  };

  return (
    <div className="w-80 h-full sidebar-area border-r border-white/5 flex flex-col pt-10 px-4 relative z-10">
      <div className="px-6 mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.7)]"></div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-black text-gray-400">В СЕТИ</h2>
          </div>
          <span className="bg-white/5 text-gray-300 text-[11px] px-3 py-1.5 rounded-[12px] font-black border border-white/10 shadow-inner">
            {participants.filter(p => p.isOnline).length}
          </span>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-white/10 to-transparent rounded-full"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-3 custom-scrollbar">
        {participants.map(p => (
          <div 
            key={p.id}
            className={`
              flex items-center justify-between p-5 rounded-[28px] transition-all group cursor-default
              ${p.isOnline ? 'text-gray-200' : 'opacity-20 grayscale'}
              ${p.id === currentUserId ? 'bg-white/5 border border-white/5 shadow-2xl' : 'hover:bg-white/[0.04]'}
            `}
          >
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-lg font-black shadow-2xl transition-transform group-hover:scale-110 ${p.id === currentUserId ? 'gradient-bg shadow-[#8A2BE2]/20' : 'bg-[#22222a] border border-white/5'}`}>
                  {p.nickname.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[4px] border-[#0e0e10] ${p.isOnline ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black truncate max-w-[130px] tracking-tight leading-none">
                  {p.nickname}
                </span>
                {p.id === currentUserId && <span className="text-[9px] font-black text-[#8A2BE2] mt-1.5 uppercase tracking-widest opacity-80">Это вы</span>}
              </div>
            </div>
            {p.isAdmin && <Crown className="w-5 h-5 text-yellow-500 drop-shadow-lg" />}
          </div>
        ))}
      </div>
      
      <div 
        onClick={copyRoomId}
        className="p-8 mt-4 mb-4 bg-[#1c1c21] border border-[#8A2BE2]/20 rounded-[36px] mx-2 group cursor-pointer hover:border-[#8A2BE2]/60 hover:bg-[#25252b] transition-all shadow-2xl active:scale-95 relative overflow-hidden"
      >
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8A2BE2] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8A2BE2]/10 flex items-center justify-center group-hover:bg-[#8A2BE2] transition-colors">
                  <UserPlus className="w-6 h-6 text-[#8A2BE2] group-hover:text-white" />
              </div>
              <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Пригласить друга</span>
                  <span className="text-[9px] text-gray-500 font-bold mt-1">Скопировать ID комнаты</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ParticipantsSidebar;
