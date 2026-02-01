
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, LogOut, Volume2, VolumeX, ChevronUp, Activity, Monitor
} from 'lucide-react';
import { User, ChatMessage } from '../types';
import ControlBar from './ControlBar';
import ChatSidebar from './ChatSidebar';
import ParticipantsSidebar from './ParticipantsSidebar';
import VideoTile from './VideoTile';
import SoundPad from './SoundPad';
import SettingsModal from './SettingsModal';

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
  // Fixed: Renamed from isScreenSharing to isSharingScreen to match User type and fix scope errors
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSoundPadOpen, setIsSoundPadOpen] = useState(false);
  const [isControlBarVisible, setIsControlBarVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingSignals = useRef<any[]>([]);
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());

  // Конфигурация WebRTC
  const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const createPeerConnection = (targetId: string) => {
    if (peerConnections.current.has(targetId)) return peerConnections.current.get(targetId)!;

    const pc = new RTCPeerConnection(rtcConfig);
    
    // Добавляем локальный аудио-трек в соединение
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        pendingSignals.current.push({ to: targetId, type: 'candidate', data: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log(`Received remote track from ${targetId}`);
      remoteStreams.current.set(targetId, event.streams[0]);
      // Форсируем обновление UI, чтобы VideoTile увидел стрим
      setParticipants(prev => [...prev]);
    };

    peerConnections.current.set(targetId, pc);
    return pc;
  };

  const handleSignal = async (signal: any) => {
    const { from, type, data } = signal;
    const pc = createPeerConnection(from);

    try {
      if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        pendingSignals.current.push({ to: from, type: 'answer', data: answer });
      } else if (type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } else if (type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch (e) {
      console.error("Signal handling error:", e);
    }
  };

  useEffect(() => {
    const syncWithServer = async () => {
      try {
        // Fixed: Use isSharingScreen which is now in scope
        const myData = { ...user, isMicOn, isCamOn, isSharingScreen, isDeafened };
        const signals = [...pendingSignals.current];
        pendingSignals.current = [];

        const response = await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: myData, signalsToSend: signals })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Обработка входящих сигналов
          for (const sig of data.signalsForMe) {
            await handleSignal(sig);
          }

          // Обновление участников и инициация Offer для новых
          const updatedParticipants = data.participants.map((p: User) => {
            if (p.id === user.id) return { ...p, stream: localStreamRef.current || undefined };
            
            // Если мы видим участника, но еще не создали Offer (и мы "старше" по ID для избежания коллизий)
            if (p.id !== user.id && !peerConnections.current.has(p.id)) {
                // Инициируем соединение
                const pc = createPeerConnection(p.id);
                pc.createOffer().then(offer => {
                    pc.setLocalDescription(offer);
                    pendingSignals.current.push({ to: p.id, type: 'offer', data: offer });
                });
            }

            return { ...p, stream: remoteStreams.current.get(p.id) };
          });
          
          setParticipants(updatedParticipants);
          if (data.messages && data.messages.length !== chatMessages.length) setChatMessages(data.messages);
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    const interval = setInterval(syncWithServer, 3000);
    return () => {
        clearInterval(interval);
        peerConnections.current.forEach(pc => pc.close());
    };
    // Fixed: Use isSharingScreen which is now in scope
  }, [roomCode, user, isMicOn, isCamOn, isSharingScreen, isDeafened, chatMessages.length]);

  const toggleMic = async () => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        // Добавляем трек во все существующие соединения
        peerConnections.current.forEach(pc => {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });
      } else {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !isMicOn);
      }
      setIsMicOn(!isMicOn);
    } catch (err) {
      alert("Доступ к микрофону отклонен");
    }
  };

  const handleSendMessage = async (text: string) => {
    const newMessage = { id: Math.random().toString(36).substr(2,9), senderId: user.id, senderNickname: user.nickname, text, timestamp: Date.now() };
    await fetch(`/api/rooms/${roomCode}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage })
    });
  };

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
          <button onClick={onLeave} className="flex items-center space-x-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl transition-all font-black text-[11px] uppercase border border-red-500/20">
            <span>Выйти</span>
          </button>
        </header>
        <main className="flex-1 p-10 overflow-y-auto relative custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center h-full">
              {participants.map(p => (
                <VideoTile key={p.id} participant={p} viewerIsAdmin={user.isAdmin} />
              ))}
           </div>
        </main>
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-50`}>
           <ControlBar 
              isMicOn={isMicOn} isCamOn={isCamOn} isDeafened={isDeafened} isScreenSharing={isSharingScreen}
              onToggleMic={toggleMic} onToggleCam={() => setIsCamOn(!isCamOn)} onToggleDeafened={() => setIsDeafened(!isDeafened)}
              onToggleScreen={() => setIsSharingScreen(!isSharingScreen)} onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onToggleSoundPad={() => setIsSoundPadOpen(!isSoundPadOpen)} onTogglePanel={() => setIsControlBarVisible(false)}
           />
        </div>
        {isSoundPadOpen && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 w-[400px]">
            <SoundPad onPlaySound={(url, label) => handleSendMessage(`🔊 ${label}`)} onClose={() => setIsSoundPadOpen(false)} />
          </div>
        )}
      </div>
      {isChatOpen && <ChatSidebar messages={chatMessages} onSendMessage={handleSendMessage} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default RoomPage;
