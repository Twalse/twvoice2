
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
  const [participants, setParticipants] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Синхронизация данных с сервером (Heartbeat + Chat + Participants)
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const myData = {
          ...user,
          isMicOn,
          isCamOn,
          isSharingScreen: isScreenSharing,
          isDeafened,
        };

        const response = await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: myData })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Обновляем список участников
          const updatedParticipants = data.participants.map((p: User) => {
            if (p.id === user.id) {
              return { ...p, stream: localStreamRef.current || undefined };
            }
            // Здесь в будущем можно добавить получение стрима через WebRTC
            return p;
          });
          setParticipants(updatedParticipants);

          // Обновляем сообщения, если они изменились
          if (data.messages && data.messages.length !== chatMessages.length) {
            setChatMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 3000);
    return () => clearInterval(interval);
  }, [roomCode, user, isMicOn, isCamOn, isScreenSharing, isDeafened, chatMessages.length]);

  // Управление микрофоном
  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
        } else {
          localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true);
        }
        setIsMicOn(true);
      } catch (err) {
        alert("Не удалось включить микрофон");
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
      }
      setIsMicOn(false);
    }
  };

  // Отправка сообщений на сервер
  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderNickname: user.nickname,
      text,
      timestamp: Date.now(),
    };

    try {
      await fetch(`/api/rooms/${roomCode}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });
      // Локально добавим сразу для скорости
      setChatMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleGlobalSound = (soundUrl: string, label: string) => {
    handleSendMessage(`🔊 Использован звук: ${label}`);
    // В идеале soundUrl должен передаваться в метаданных сообщения
  };

  // Остальные функции (Cam, ScreenShare)
  const toggleCam = async () => { /* ... аналогично toggleMic ... */ setIsCamOn(!isCamOn); };
  const toggleScreenShare = async () => { setIsScreenSharing(!isScreenSharing); };
  const handleKick = (id: string) => console.log("Kick", id);
  const handleMute = (id: string) => console.log("Mute", id);

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
          </div>

          <div className="flex items-center space-x-4">
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
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center h-full">
              {participants.map(p => (
                <VideoTile key={p.id} participant={p} viewerIsAdmin={user.isAdmin} onKick={handleKick} onMute={handleMute} />
              ))}
           </div>
        </main>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isControlBarVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
           <ControlBar 
              isMicOn={isMicOn} isCamOn={isCamOn} isDeafened={isDeafened} isScreenSharing={isScreenSharing}
              onToggleMic={toggleMic} onToggleCam={toggleCam} onToggleDeafened={() => setIsDeafened(!isDeafened)}
              onToggleScreen={toggleScreenShare} onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onToggleSoundPad={() => setIsSoundPadOpen(!isSoundPadOpen)} onTogglePanel={() => setIsControlBarVisible(false)}
           />
        </div>

        {!isControlBarVisible && (
          <button onClick={() => setIsControlBarVisible(true)} className="absolute bottom-10 left-1/2 -translate-x-1/2 p-4 bg-[var(--accent)] text-white rounded-full shadow-2xl z-50 border-4 border-white/20">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        {isSoundPadOpen && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 w-[400px]">
            <SoundPad onPlaySound={handleGlobalSound} onClose={() => setIsSoundPadOpen(false)} />
          </div>
        )}
      </div>

      {isChatOpen && (
        <ChatSidebar messages={chatMessages} onSendMessage={handleSendMessage} onClose={() => setIsChatOpen(false)} />
      )}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default RoomPage;
