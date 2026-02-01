
export interface User {
  id: string;
  nickname: string;
  isAdmin: boolean;
  isOnline: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isDeafened: boolean;
  isSharingScreen: boolean;
  stream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderNickname: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  soundUrl?: string;
}

export enum AppState {
  LANDING = 'LANDING',
  ROOM = 'ROOM'
}
