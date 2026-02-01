
import React, { useState } from 'react';
import { Plus, LogIn, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface LandingPageProps {
  onCreate: (nickname: string) => void;
  onJoin: (nickname: string, code: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onCreate, onJoin }) => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!nickname.trim()) return;
    onCreate(nickname);
  };

  const handleJoinClick = () => {
    if (!nickname.trim()) return;
    if (isJoining) {
      const activeRooms = JSON.parse(localStorage.getItem('twvoice_rooms') || '[]');
      if (!activeRooms.includes(roomCode.toUpperCase())) {
        setError('Комната не найдена. Проверьте код.');
        setTimeout(() => setError(''), 3000);
        return;
      }
      onJoin(nickname, roomCode.toUpperCase());
    } else {
      setIsJoining(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#212126] relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[700px] h-[700px] bg-[#8A2BE2]/25 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[700px] h-[700px] bg-[#4169E1]/25 blur-[120px] rounded-full"></div>

      <div className="mb-14 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <h1 className="text-8xl font-black tracking-tighter text-white mb-3 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">TwVoice</h1>
        <div className="w-40 h-2.5 bg-gradient-to-r from-[#8A2BE2] to-[#4169E1] mx-auto rounded-full shadow-lg"></div>
      </div>

      <div className="w-full max-w-[560px] glass-card rounded-[48px] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] z-10 border border-white/20 bg-white/[0.08]">
        <div className="space-y-10">
          {!isJoining ? (
            <div className="space-y-10 animate-pop">
              <div className="space-y-4">
                <label className="block text-[13px] uppercase tracking-[0.3em] font-black text-gray-200 ml-2">
                  Ваш никнейм <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Как к вам обращаться?"
                  className="w-full bg-[#2d2d35] border border-white/10 rounded-[24px] px-8 py-6 text-white placeholder-gray-400 focus:ring-4 focus:ring-[#8A2BE2]/40 transition-all outline-none text-xl font-bold shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={handleCreate}
                  disabled={!nickname.trim()}
                  className="group flex flex-col items-center justify-center space-y-4 bg-[#353540] hover:bg-[#40404a] p-10 rounded-[32px] border border-white/10 transition-all disabled:opacity-40 disabled:grayscale hover:scale-[1.05] active:scale-95 shadow-2xl"
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-[24px] bg-green-500/20 group-hover:bg-green-500/30 transition-colors shadow-xl">
                    <Plus className="text-green-400 w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-white text-lg tracking-tight">СОЗДАТЬ</p>
                    <p className="text-[12px] text-gray-400 mt-1 font-black tracking-widest">КОМНАТУ</p>
                  </div>
                </button>

                <button
                  onClick={handleJoinClick}
                  disabled={!nickname.trim()}
                  className="group flex flex-col items-center justify-center space-y-4 bg-[#353540] hover:bg-[#40404a] p-10 rounded-[32px] border border-white/10 transition-all disabled:opacity-40 disabled:grayscale hover:scale-[1.05] active:scale-95 shadow-2xl"
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-[24px] bg-[#4169E1]/20 group-hover:bg-[#4169E1]/30 transition-colors shadow-xl">
                    <LogIn className="text-[#4169E1] w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-white text-lg tracking-tight">ВОЙТИ</p>
                    <p className="text-[12px] text-gray-400 mt-1 font-black tracking-widest">ПО КОДУ</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-pop">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Вход в комнату</h3>
                <button onClick={() => { setIsJoining(false); setError(''); }} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block text-[13px] uppercase tracking-[0.3em] font-black text-gray-200 ml-2">
                  Код комнаты
                </label>
                <input
                  autoFocus
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="X X X X X X"
                  className={`w-full bg-[#2d2d35] border rounded-[24px] px-8 py-6 text-white placeholder-gray-500 focus:ring-4 transition-all outline-none text-3xl font-black text-center tracking-[0.5em] shadow-2xl ${error ? 'border-red-500 animate-shake' : 'border-white/10 focus:ring-[#8A2BE2]/40'}`}
                />
                {error && <p className="text-red-400 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}
              </div>
              <button
                onClick={handleJoinClick}
                disabled={!roomCode.trim()}
                className="w-full flex items-center justify-center space-x-3 bg-[#8A2BE2] hover:bg-[#9d40f5] text-white py-6 rounded-[24px] font-black text-xl transition-all shadow-[0_15px_30px_rgba(138,43,226,0.3)] disabled:opacity-50 hover:scale-[1.02] active:scale-95"
              >
                <span>ПРИСОЕДИНИТЬСЯ</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-300">
              <ShieldCheck className="w-6 h-6 text-green-400" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em]">P2P ШИФРОВАНИЕ</span>
            </div>
            <span className="text-[12px] text-gray-400 font-black">v2.1 GOLD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
