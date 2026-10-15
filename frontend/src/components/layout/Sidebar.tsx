import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Library, 
  TrendingUp, 
  User, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'train', label: 'Train', icon: Dumbbell },
    { id: 'exercises', label: 'Exercises', icon: Library },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111111] border-r border-[#181818] flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#181818] flex items-center justify-between">
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="cursor-pointer flex items-center gap-3 group"
            title="FormiQ Dashboard"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentTab('dashboard'); }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#262626] p-1 flex items-center justify-center group-hover:border-[#C8FF3D]/50 transition-all shadow-sm">
              <img src="/logo-icon.png" alt="FORMIQ" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-white leading-none">FORMIQ</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8FF3D]"></span>
              </div>
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 block mt-0.5">AI Biomechanics</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-6 space-y-1">
          <div className="px-3 pb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1a1a1a] text-[#C8FF3D] border-l-2 border-[#C8FF3D] shadow-sm font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#C8FF3D]' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Profile & Settings */}
      <div className="p-3 border-t border-[#181818] space-y-1">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Preferences
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-[#1a1a1a] text-[#C8FF3D] font-semibold border-l-2 border-[#C8FF3D]'
                  : 'text-zinc-300 hover:text-white hover:bg-[#181818]'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#C8FF3D]' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User Card */}
        <div className="pt-3 mt-2 border-t border-[#181818] flex items-center justify-between px-2">
          <div 
            onClick={() => setCurrentTab('profile')}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'Athlete'} 
                className="w-9 h-9 rounded-full object-cover border border-[#C8FF3D]/50 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] group-hover:border-[#C8FF3D]/50 flex items-center justify-center font-display font-bold text-sm text-[#C8FF3D] transition-colors">
                {user?.full_name ? user.full_name.charAt(0) : 'A'}
              </div>
            )}
            <div className="truncate text-left">
              <p className="text-sm font-semibold text-white group-hover:text-[#C8FF3D] transition-colors truncate">{user?.full_name || 'Athlete'}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.handle || user?.email || 'Pro Athlete'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              setCurrentTab('landing');
            }}
            title="Log Out"
            className="p-1.5 rounded-md hover:bg-[#181818] text-[#666666] hover:text-[#FF5C5C] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
