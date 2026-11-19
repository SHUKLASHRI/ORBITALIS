import React from 'react';
import { HelpCircle, Settings, Sliders } from 'lucide-react';

interface HeaderProps {
  currentTab: 'simulate' | 'edit' | 'analyze' | 'scenarios' | 'about';
  onSelectTab: (tab: 'simulate' | 'edit' | 'analyze' | 'scenarios' | 'about') => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenEditSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenHelp,
  onOpenEditSimulation,
}) => {
  return (
    <header className="absolute top-3 left-4 right-4 z-40 h-11 flex items-center justify-between pointer-events-none select-none font-sans">
      {/* Brand Identity */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          {/* Planetary Ring Icon */}
          <svg className="w-6 h-6 text-[#8797FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="5" />
            <path d="M3 13c3-4 15-4 18 0" strokeDasharray="1 0" />
            <ellipse cx="12" cy="12" rx="10" ry="4" strokeLinecap="round" />
          </svg>
          <span className="font-bold tracking-widest text-[#E8EEF7] text-sm">ORBITALIS</span>
        </div>
        <div className="h-3.5 w-px bg-[#263447]" />
        <span className="text-[#8E9BAD] text-xs font-normal">N-Body Gravity Simulator</span>
      </div>

      {/* Center Navigation Pills with Prominent "Edit Simulation" Option */}
      <nav className="pointer-events-auto flex items-center bg-[#101722]/90 backdrop-blur-md border border-[#263447] p-1 rounded-full shadow-lg">
        {[
          { id: 'simulate', label: 'Simulate' },
          { id: 'edit', label: 'Edit Simulation', icon: Sliders },
          { id: 'scenarios', label: 'Scenarios' },
          { id: 'analyze', label: 'Analyze' },
          { id: 'about', label: 'About' },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'edit') {
                  onOpenEditSimulation();
                } else {
                  onSelectTab(tab.id as typeof currentTab);
                }
              }}
              className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/50 shadow-[0_0_12px_rgba(135,151,255,0.25)] font-semibold'
                  : 'text-[#8E9BAD] hover:text-[#E8EEF7] border border-transparent'
              }`}
            >
              {Icon && <Icon size={12} className="text-[#8797FF]" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Edit, Help & Settings */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={onOpenEditSimulation}
          className="px-2.5 py-1 bg-[#141E2B] hover:bg-[#8797FF]/20 text-[#8797FF] hover:text-white border border-[#263447] hover:border-[#8797FF]/50 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
          title="Open Simulation Parameters Editor"
        >
          <Sliders size={14} />
          <span className="hidden sm:inline">Edit Physics</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-1.5 text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B] rounded-lg transition border border-transparent hover:border-[#263447]"
          title="Observatory Help & Guide"
        >
          <HelpCircle size={18} />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B] rounded-lg transition border border-transparent hover:border-[#263447]"
          title="Simulation Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
