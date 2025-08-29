import React from 'react';
import { LspPhase } from '../types';
import { PHASE_DESCRIPTIONS } from '../constants';
import { Logo, CopyIcon } from './icons';

interface PhaseTrackerProps {
  currentPhase: LspPhase;
  onCopyChat: () => void;
  isCopied: boolean;
}

const PhaseTracker: React.FC<PhaseTrackerProps> = ({ currentPhase, onCopyChat, isCopied }) => {
  return (
    <div className="w-80 h-screen bg-slate-800 text-white p-6 flex flex-col fixed top-0 left-0">
      <div className="flex items-center space-x-3 mb-8">
        <Logo />
        <h1 className="text-xl font-bold">LSP Insight System</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {Object.entries(PHASE_DESCRIPTIONS).map(([phase, { title, description, icon: Icon }]) => {
            const phaseNum = parseInt(phase, 10);
            const isActive = currentPhase === phaseNum;
            const isCompleted = currentPhase > phaseNum;

            return (
              <li key={phase}>
                <div
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="relative">
                     <div className={`absolute -left-[29px] top-0 h-full w-1 rounded-r-lg transition-all duration-300 ${isActive ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isActive || isCompleted ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className={`font-bold transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {title}
                    </h3>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-xs text-slate-500">
        <button
          onClick={onCopyChat}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 mb-4"
        >
          <CopyIcon className="w-4 h-4" />
          <span>{isCopied ? '¡Copiado!' : 'Copiar Chat'}</span>
        </button>
        <p className="text-center">Facilitador de LEGO® Serious Play®</p>
      </div>
    </div>
  );
};

export default PhaseTracker;