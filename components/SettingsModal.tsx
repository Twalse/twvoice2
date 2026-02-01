
import React, { useState } from 'react';
import { X, Video, Volume2, Palette, Shield, Monitor, Settings, Info } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('audio');
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (document.documentElement.classList.contains('theme-oled')) return 'oled';
    if (document.documentElement.classList.contains('theme-light')) return 'light';
    if (document.documentElement.classList.contains('theme-green')) return 'green';
    if (document.documentElement.classList.contains('theme-blue')) return 'blue';
    return 'gamer';
  });

  const tabs = [
    { id: 'audio', label: 'Звук', icon: Volume2 },
    { id: 'video', label: 'Видео', icon: Video },
    { id: 'theme', label: 'Тема', icon: Palette },
    { id: 'security', label: 'Связь', icon: Shield },
  ];

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.classList.remove('theme-oled', 'theme-light', 'theme-green', 'theme-blue');
    if (theme !== 'gamer') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  };

  const PageUnderDev = () => (
    <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40 animate-in fade-in duration-500">
       <div className="w-24 h-24 bg-[#8A2BE2]/10 rounded-full flex items-center justify-center">
          <Info className="w-12 h-12 text-[#8A2BE2]" />
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--text)]">Страничка на доработке</h2>
          <p className="text-sm font-bold opacity-60">Этот раздел станет доступен в следующем обновлении</p>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-card-custom rounded-[56px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row h-[650px] animate-pop">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 sidebar-area border-r border-white/5 p-8 flex flex-col">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text)]">TwVoice</h2>
          </div>
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[24px] transition-all font-black text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-2xl shadow-[var(--accent)]/30 scale-105' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-white/5 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">BUILD: 2.1.2-GOLD</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 flex flex-col relative bg-gradient-to-br from-transparent to-black/5 overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-[var(--text)] transition-all shadow-xl">
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1">
            {(activeTab === 'audio' || activeTab === 'video') && <PageUnderDev />}

            {activeTab === 'theme' && (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-[var(--text)]">Интерфейс</h2>
                        <p className="text-gray-500 text-sm font-medium">Выберите стиль оформления TwVoice.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleThemeChange('gamer')}
                            className={`p-6 rounded-[32px] text-left transition-all border-4 shadow-xl ${currentTheme === 'gamer' ? 'bg-black/20 border-[#8A2BE2]' : 'bg-black/5 border-white/5 grayscale opacity-50'}`}
                        >
                            <p className="font-black text-lg tracking-tight text-[var(--text)]">Classic Gamer</p>
                        </button>
                        
                        <button 
                            onClick={() => handleThemeChange('oled')}
                            className={`p-6 rounded-[32px] text-left transition-all border-4 shadow-xl ${currentTheme === 'oled' ? 'bg-black/20 border-white' : 'bg-black/5 border-white/5 grayscale opacity-50'}`}
                        >
                            <p className="font-black text-lg tracking-tight text-[var(--text)]">OLED Black</p>
                        </button>

                        <button 
                            onClick={() => handleThemeChange('light')}
                            className={`p-6 rounded-[32px] text-left transition-all border-4 shadow-xl ${currentTheme === 'light' ? 'bg-white border-[#8A2BE2]' : 'bg-white/20 border-black/10 grayscale opacity-50'}`}
                        >
                            <p className="font-black text-lg tracking-tight text-gray-900">Snow White</p>
                        </button>

                        <button 
                            onClick={() => handleThemeChange('green')}
                            className={`p-6 rounded-[32px] text-left transition-all border-4 shadow-xl ${currentTheme === 'green' ? 'bg-[#0d2315] border-[#10b981]' : 'bg-[#0d2315]/20 border-white/5 grayscale opacity-50'}`}
                        >
                            <p className="font-black text-lg tracking-tight text-white">Emerald Green</p>
                        </button>

                        <button 
                            onClick={() => handleThemeChange('blue')}
                            className={`p-6 rounded-[32px] text-left transition-all border-4 shadow-xl ${currentTheme === 'blue' ? 'bg-[#112240] border-[#00d2ff]' : 'bg-[#112240]/20 border-white/5 grayscale opacity-50'}`}
                        >
                            <p className="font-black text-lg tracking-tight text-white">Deep Blue</p>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-[var(--text)]">Связь</h2>
                        <p className="text-gray-500 text-sm font-medium">Статус безопасности подключения.</p>
                    </div>
                    
                    <div className="p-10 bg-[var(--accent)]/10 border-2 border-[var(--accent)]/20 rounded-[40px] flex items-center space-x-6 shadow-2xl">
                        <div className="w-16 h-16 bg-[var(--accent)] rounded-[24px] flex items-center justify-center shadow-lg">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-[var(--accent)] uppercase tracking-tighter">Шифрование активно</p>
                            <p className="text-sm text-[var(--accent)]/60 mt-1 font-medium">P2P Тоннель защищен.</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
