
import React, { useState } from 'react';
import { Plus, LogIn, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface LandingPageProps {
  onCreate: (nickname: string) => Promise<void>;
  onJoin: (nickname: string, code: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onCreate, onJoin }) => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nickname.trim() || loading) return;
    setLoading(true);
    try {
      await onCreate(nickname.trim());
    } catch (err) {
      setError('Ошибка при создании комнаты.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = async () => {
    if (!nickname.trim() || loading) {
        if (!nickname.trim()) setError('Введите никнейм');
        return;
    }
    
    if (isJoining) {
      const cleanCode = roomCode.trim().toUpperCase();
      if (!cleanCode) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/rooms/${cleanCode}`);
        const data = await res.json();
        
        if (data.exists) {
          onJoin(nickname.trim(), cleanCode);
        } else {
          setError('Комната не найдена.');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError('Ошибка связи с сервером.');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    } else {
      setIsJoining(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#212126] relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[700px] h-[700px] bg-[#8A2BE2]/25 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[700px] h-[700px] bg-[#4169E1]/25 blur-[120px] rounded-full"></div>

      <div className="mb-14 text-center">
        <h1 className="text-8xl font-black tracking-tighter text-white mb-3">TwVoice</h1>
        <div className="w-40 h-2.5 bg-gradient-to-r from-[#8A2BE2] to-[#4169E1] mx-auto rounded-full shadow-lg"></div>
      </div>

      <div className="w-full max-w-[560px] glass-card rounded-[48px] p-12 shadow-2xl z-10 border border-white/20 bg-white/[0.08]">
        <div className="space-y-10">
          {!isJoining ? (
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[13px] uppercase tracking-[0.3em] font-black text-gray-200 ml-2">Никнейм</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Введите имя..."
                  className="w-full bg-[#2d2d35] border border-white/10 rounded-[24px] px-8 py-6 text-white text-xl font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={handleCreate}
                  disabled={!nickname.trim() || loading}
                  className="group flex flex-col items-center p-10 bg-[#353540] hover:bg-[#40404a] rounded-[32px] border border-white/10 disabled:opacity-40"
                >
                  <Plus className={`w-10 h-10 text-green-400 mb-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="font-black text-white">СОЗДАТЬ</span>
                </button>

                <button
                  onClick={handleJoinClick}
                  disabled={!nickname.trim() || loading}
                  className="group flex flex-col items-center p-10 bg-[#353540] hover:bg-[#40404a] rounded-[32px] border border-white/10 disabled:opacity-40"
                >
                  <LogIn className="w-10 h-10 text-[#4169E1] mb-4" />
                  <span className="font-black text-white">ВОЙТИ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-pop">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase">Код комнаты</h3>
                <button onClick={() => setIsJoining(false)} className="p-2 text-gray-400 hover:text-white"><X /></button>
              </div>
              <input
                autoFocus
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="X X X X X X"
                className="w-full bg-[#2d2d35] border border-white/10 rounded-[24px] px-8 py-6 text-white text-3xl font-black text-center tracking-[0.5em] outline-none"
              />
              <button
                onClick={handleJoinClick}
                disabled={!roomCode.trim() || loading}
                className="w-full bg-[#8A2BE2] hover:bg-[#9d40f5] text-white py-6 rounded-[24px] font-black text-xl transition-all disabled:opacity-50"
              >
                {loading ? 'ПРОВЕРКА...' : 'ВОЙТИ В КОМНАТУ'}
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-center font-bold uppercase text-[10px] tracking-widest">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
