
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, LogOut, Volume2, VolumeX, ChevronUp, Activity, Monitor, UserPlus
} from 'lucide-react';
import { User, ChatMessage } from '../types';
import ControlBar from './ControlBar';
import ChatSidebar from './ChatSidebar';
import ParticipantsSidebar from './ParticipantsSidebar';
import VideoTile from './VideoTile';
import SoundPad from './SoundPad';
import SettingsModal from './SettingsModal';
import { SYSTEM_SOUNDS } from '../constants';

interface RoomPageProps {
  roomCode: string;
  user: User;
  onLeave: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomCode, user, onLeave }) => {
  const [participants, setParticipants] = useState<User[]>([
    { ...user, isOnline: true }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: 'system', senderNickname: 'TwVoice', text: `Добро пожаловать в комнату ${roomCode}!`, timestamp: Date.now(), isSystem: true },
  ]);

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isStreamAudioOn, setIsStreamAudioOn] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSoundPadOpen, setIsSoundPadOpen] = useState(false);
  const [isControlBarVisible, setIsControlBarVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const lastPlayedSoundMsgId = useRef<string | null>(null);

  useEffect(() => {
    const playJoinSound = () => {
      const audio = new Audio(SYSTEM_SOUNDS.join);
      audio.volume = 0.4;
      audio.play().catch(() => {
        console.log("System join sound suppressed until user interaction.");
      });
    };
    playJoinSound();
  }, []);

  // Effect to listen for global sounds in chat messages
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.soundUrl && lastMsg.id !== lastPlayedSoundMsgId.current) {
      lastPlayedSoundMsgId.current = lastMsg.id;
      // Play the sound locally
      const audio = new Audio(lastMsg.soundUrl);
      audio.volume = 0.5;
      audio.play().catch(e => console.warn("Global sound playback failed:", e));
    }
  }, [chatMessages]);

  useEffect(() => {
    setParticipants(prev => prev.map(p => p.id === user.id ? { 
      ...p, 
      isMicOn, 
      isCamOn, 
      isSharingScreen: isScreenSharing, 
      isDeafened,
      stream: localStreamRef.current || undefined 
    } : p));

    if (isScreenSharing) {
      const audio = new Audio(SYSTEM_SOUNDS.streamStart);
      audio.play().catch(() => {});
    }
  }, [isMicOn, isCamOn, isScreenSharing, isDeafened, user.id]);

  const handleAddNPC = () => {
    const names = ["ShadowHunter", "CyberGhost", "EliteSniper", "Rogue_One", "Viper_X", "BlazeMaster", "FrostByte", "IronFist", "Nexus_Player"];
    const name = names[Math.floor(Math.random() * names.length)] + "_" + Math.floor(Math.random() * 100);
    const newNPC: User = {
      id: 'npc_' + Math.random().toString(36).substr(2, 5),
      nickname: name,
      isAdmin: false,
      isOnline: true,
      isMicOn: false,
      isCamOn: false,
      isDeafened: false,
      isSharingScreen: false
    };
    setParticipants(prev => [...prev, newNPC]);
  };

  const handleGlobalSound = (soundUrl: string, label: string) => {
    // Add message to chat to trigger sound for all (simulated)
    const soundMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      senderId: user.id,
      senderNickname: user.nickname,
      text: `🔊 Использован звук: ${label}`,
      timestamp: Date.now(),
      isSystem: true,
      soundUrl: soundUrl
    };
    setChatMessages(prev => [...prev, soundMessage]);
  };

  const toggleMic = async () => {
    if (!isMicOn && !localStreamRef.current) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
        } catch (err: any) { 
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              alert("Доступ к микрофону заблокирован.");
            }
            return; 
        }
    }
    setIsMicOn(!isMicOn);
  };
  
  const toggleCam = async () => {
    if (!isCamOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setIsCamOn(true);
      } catch (err: any) { 
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            alert("Доступ к камере заблокирован.");
          }
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => track.stop());
      }
      setIsCamOn(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } catch (err: any) { 
        console.error("Screen share error:", err);
      }
    } else { setIsScreenSharing(false); }
  };

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderNickname: user.nickname,
      text,
      timestamp: Date.now(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handleKick = (userId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const handleMute = (userId: string) => {
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isMicOn: false } : p));
  };

  const someoneIsSharing = participants.some(p => p.isSharingScreen);
  const sharingUser = participants.find(p => p.isSharingScreen);

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text)] room-area">
      <ParticipantsSidebar participants={participants} currentUserId={user.id} roomCode={roomCode} />

      <div className="flex-1 flex flex-col relative bg-card-custom m-4 rounded-[40px] shadow-2xl overflow-hidden border border-white/5">
        <header className="h-20 flex items-center justify-between px-8 bg-black/10 backdrop-blur-2xl border-b border-white/5 z-20">
          <div className="flex items-center space-x-5">
            <span className="font-black text-2xl tracking-tighter gradient-text uppercase">TwVoice</span>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center space-x-4 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
              <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 tracking-widest uppercase">Live</span>
            </div>
            {user.isAdmin && (
              <button 
                onClick={handleAddNPC}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-[var(--accent)]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Добавить NPC</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
             {someoneIsSharing && (
               <button 
                 onClick={() => setIsStreamAudioOn(!isStreamAudioOn)}
                 className={`flex items-center space-x-3 px-6 py-2.5 rounded-2xl border transition-all ${isStreamAudioOn ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/40 text-[#8A2BE2]' : 'bg-red-500/10 border-red-500/40 text-red-500'}`}
               >
                 {isStreamAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">Звук: {isStreamAudioOn ? 'ВКЛ' : 'ВЫКЛ'}</span>
               </button>
             )}
             <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-[var(--text)] transition-all">
                <Settings className="w-5 h-5" />
             </button>
             <button onClick={onLeave} className="flex items-center space-x-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border border-red-500/20">
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
             </button>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto relative custom-scrollbar">
           {someoneIsSharing ? (
             <div className="h-full flex flex-col space-y-6">
                <div className="flex-1 bg-black rounded-[48px] overflow-hidden border-4 border-[var(--accent)] shadow-[0_0_50px_rgba(138,43,226,0.2)] relative group">
                   <div className="absolute top-8 left-8 z-10 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white">ТРАНСЛЯЦИЯ: {sharingUser?.nickname}</span>
                   </div>
                   <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                      <Monitor className="w-24 h-24 text-white/5" />
                   </div>
                </div>
                <div className="grid grid-cols-4 gap-6 h-48">
                   {participants.map(p => (
                      <VideoTile key={p.id} participant={p} compact viewerIsAdmin={user.isAdmin} onKick={handleKick} onMute={handleMute} />
                   ))}
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10 items-center justify-center h-full">
                {participants.map(p => (
                  <VideoTile key={p.id} participant={p} viewerIsAdmin={user.isAdmin} onKick={handleKick} onMute={handleMute} />
                ))}
             </div>
           )}
        </main>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isControlBarVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
           <ControlBar 
              isMicOn={isMicOn}
              isCamOn={isCamOn}
              isDeafened={isDeafened}
              isScreenSharing={isScreenSharing}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
              onToggleDeafened={() => setIsDeafened(!isDeafened)}
              onToggleScreen={toggleScreenShare}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onToggleSoundPad={() => setIsSoundPadOpen(!isSoundPadOpen)}
              onTogglePanel={() => setIsControlBarVisible(false)}
           />
        </div>

        {!isControlBarVisible && (
          <button 
            onClick={() => setIsControlBarVisible(true)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 p-4 bg-[var(--accent)] text-white rounded-full shadow-[0_0_30px_rgba(138,43,226,0.5)] hover:scale-110 active:scale-90 transition-all z-50 group border-4 border-white/20"
          >
            <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        )}

        {isSoundPadOpen && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 w-[400px]">
            <SoundPad onPlaySound={handleGlobalSound} onClose={() => setIsSoundPadOpen(false)} />
          </div>
        )}
      </div>

      {isChatOpen && (
        <ChatSidebar 
          messages={chatMessages} 
          onSendMessage={handleSendMessage} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default RoomPage;
