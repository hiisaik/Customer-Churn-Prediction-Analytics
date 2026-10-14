import React from 'react';
import { BarChart3, Binary, Database, Network, Sliders, Briefcase } from 'lucide-react';

export type ActiveTab = 'executive' | 'prediction' | 'sql' | 'models' | 'clusters' | 'interview';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div 
          onClick={() => onTabChange('executive')}
          className="cursor-pointer flex items-center gap-2.5 text-slate-100 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20">
            TC
          </div>
          <span className="text-base font-bold tracking-tight">Telco Churn Intelligence</span>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean unboxed typography) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-300">
          <button
            onClick={() => onTabChange('executive')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'executive' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive BI</span>
          </button>

          <button
            onClick={() => onTabChange('prediction')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'prediction' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Inference & SHAP</span>
          </button>

          <button
            onClick={() => onTabChange('sql')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'sql' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Studio</span>
          </button>

          <button
            onClick={() => onTabChange('models')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'models' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Model Lab & Cost Curve</span>
          </button>

          <button
            onClick={() => onTabChange('clusters')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'clusters' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>K-Means Strategy</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('interview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Interview & Code Kit</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="lg:hidden flex items-center justify-between overflow-x-auto pt-3 border-t border-slate-800/60 mt-2.5 gap-4 text-xs">
        <button
          onClick={() => onTabChange('executive')}
          className={`whitespace-nowrap pb-1 ${activeTab === 'executive' ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' : 'text-slate-400'}`}
        >
          Executive BI
        </button>
        <button
          onClick={() => onTabChange('prediction')}
          className={`whitespace-nowrap pb-1 ${activeTab === 'prediction' ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' : 'text-slate-400'}`}
        >
          Inference & SHAP
        </button>
        <button
          onClick={() => onTabChange('sql')}
          className={`whitespace-nowrap pb-1 ${activeTab === 'sql' ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' : 'text-slate-400'}`}
        >
          SQL Studio
        </button>
        <button
          onClick={() => onTabChange('models')}
          className={`whitespace-nowrap pb-1 ${activeTab === 'models' ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' : 'text-slate-400'}`}
        >
          Model Lab
        </button>
        <button
          onClick={() => onTabChange('clusters')}
          className={`whitespace-nowrap pb-1 ${activeTab === 'clusters' ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' : 'text-slate-400'}`}
        >
          K-Means
        </button>
      </div>
    </header>
  );
};
