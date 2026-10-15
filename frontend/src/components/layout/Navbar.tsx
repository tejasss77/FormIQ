import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const handleNavClick = (tab: string) => {
    if (!user && (tab === 'dashboard' || tab === 'train' || tab === 'exercises' || tab === 'progress')) {
      setCurrentTab('login');
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#090909]/80 backdrop-blur-md border-b border-[#181818]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title={user ? "FormiQ Dashboard" : "FormiQ Home"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick(user ? 'dashboard' : 'landing'); }}
        >
          <div className="w-9 h-9 rounded-xl bg-[#111111] border border-[#262626] p-1 flex items-center justify-center group-hover:border-[#C8FF3D]/60 transition-all shadow-sm">
            <img src="/logo-icon.png" alt="FORMIQ" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">FORMIQ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF3D]"></span>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleNavClick('dashboard')} 
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleNavClick('train')} 
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Train
          </button>
          <button 
            onClick={() => handleNavClick('exercises')} 
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Exercises
          </button>
          <button 
            onClick={() => handleNavClick('progress')} 
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Progress
          </button>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition-transform active:scale-95 cursor-pointer shadow-sm"
              >
                <span>Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  logout();
                  setCurrentTab('landing');
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('login')}
                className="text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentTab('register')}
                className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
