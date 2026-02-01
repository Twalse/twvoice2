
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
// Fixed: Added MessageSquare to the imports from lucide-react
import { Send, X, Hash, Smile, MessageSquare } from 'lucide-react';

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ messages, onSendMessage, onClose }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="w-96 h-full sidebar-area border-l border-white/5 flex flex-col pt-6 px-4">
      <div className="h-16 px-8 flex items-center justify-between border-b border-white/10 mb-4 mx-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white/5 rounded-xl">
             <Hash className="w-5 h-5 text-[#8A2BE2]" />
          </div>
          <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">ТЕКСТОВЫЙ ЧАТ</h2>
        </div>
        <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl shadow-xl">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-500">Чат пуст</p>
            <p className="text-[11px] font-bold text-gray-600 mt-3 max-w-[150px]">Будьте первым, кто напишет!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="animate-pop">
            {msg.isSystem ? (
              <div className="flex flex-col items-center py-6">
                 <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] bg-white/10 px-5 py-2 rounded-[20px] border border-white/10 shadow-2xl">
                    {msg.text}
                 </span>
              </div>
            ) : (
              <div className="group">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg ${msg.senderNickname === 'system' ? 'bg-gray-800' : 'bg-[#8A2BE2]'}`}>
                    {msg.senderNickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-[#8A2BE2] uppercase tracking-widest">{msg.senderNickname}</span>
                    <span className="text-[8px] text-gray-600 font-black mt-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed break-words bg-[#1c1c23] p-5 rounded-[28px] rounded-tl-none border border-white/5 shadow-2xl group-hover:border-[#8A2BE2]/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8A2BE2]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-[#0e0e10] border-t border-white/10 mx-2 mb-6 rounded-[36px] shadow-2xl">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Написать всем..."
            className="w-full bg-[#1c1c21] border border-white/10 rounded-[24px] pl-6 pr-16 py-5 text-sm font-bold text-white placeholder-gray-500 focus:ring-4 focus:ring-[#8A2BE2]/30 transition-all outline-none shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-[#8A2BE2] text-white rounded-[20px] hover:scale-110 active:scale-90 transition-all shadow-[0_10px_20px_rgba(138,43,226,0.4)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSidebar;
