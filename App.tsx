
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import RoomPage from './components/RoomPage';
import { AppState, User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [roomCode, setRoomCode] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleCreateRoom = (nickname: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Регистрируем комнату локально для симуляции БД
    const rooms = JSON.parse(localStorage.getItem('twvoice_rooms') || '[]');
    localStorage.setItem('twvoice_rooms', JSON.stringify([...rooms, code]));

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      nickname,
      isAdmin: true,
      isOnline: true,
      isMicOn: false,
      isCamOn: false,
      isDeafened: false,
      isSharingScreen: false,
    };
    setRoomCode(code);
    setCurrentUser(newUser);
    setCurrentPage(AppState.ROOM);
  };

  const handleJoinRoom = (nickname: string, code: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      nickname,
      isAdmin: false,
      isOnline: true,
      isMicOn: false,
      isCamOn: false,
      isDeafened: false,
      isSharingScreen: false,
    };
    setRoomCode(code);
    setCurrentUser(newUser);
    setCurrentPage(AppState.ROOM);
  };

  const handleLeaveRoom = () => {
    setCurrentPage(AppState.LANDING);
    setRoomCode('');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0d0d0f]">
      {currentPage === AppState.LANDING ? (
        <LandingPage onCreate={handleCreateRoom} onJoin={handleJoinRoom} />
      ) : (
        currentUser && (
          <RoomPage 
            roomCode={roomCode} 
            user={currentUser} 
            onLeave={handleLeaveRoom} 
          />
        )
      )}
    </div>
  );
};

export default App;
