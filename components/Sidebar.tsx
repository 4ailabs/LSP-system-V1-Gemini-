

import React, { useState } from 'react';
import { LspPhase, MessagePart, Message } from '../types';
import { PHASE_DESCRIPTIONS } from '../constants';
import { 
    Logo, CopyIcon, PlusIcon, 
    ChevronDownIcon, GalleryIcon, InsightsIcon, EvaluationIcon
} from './icons';

interface SidebarProps {
  messages: Message[];
  currentPhase: LspPhase;
  onNewSession: () => void;
  onCopyChat: () => void;
  isCopied: boolean;
}

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-2 px-2 rounded hover:bg-slate-700/50">
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="py-2 pl-4 pr-2">{children}</div>}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ messages, currentPhase, onNewSession, onCopyChat, isCopied }) => {
    const models = messages
        .flatMap(m => m.parts)
        .filter((part): part is MessagePart & { image: NonNullable<MessagePart['image']> } => !!part.image)
        .map((part, index) => ({ ...part.image, id: `model-${index}` })) || [];
    
    const insights = messages.filter(m => m.isInsight) || [];

    return (
    <div className="w-80 h-screen bg-slate-800 text-white p-4 flex flex-col fixed top-0 left-0">
        <div className="flex items-center space-x-3 mb-6 px-2">
            <Logo />
            <h1 className="text-xl font-bold">LSP Insight System</h1>
        </div>
      
        <div className="flex-1 overflow-y-auto space-y-4 -mr-2 pr-2">
            {/* Single Session Section */}
            <CollapsibleSection title="Mi Sesión" icon={<PlusIcon className="w-5 h-5"/>}>
                <div className="p-2 text-sm text-slate-300">
                    <p>Sesión Única</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {messages.length} mensajes
                    </p>
                </div>
                <button onClick={onNewSession} className="w-full flex items-center space-x-2 text-sm mt-2 p-2 rounded text-slate-300 hover:bg-slate-700/50 hover:text-white">
                    <PlusIcon className="w-4 h-4" />
                    <span>Nueva Sesión</span>
                </button>
            </CollapsibleSection>

            {/* Phases Section */}
            <CollapsibleSection title="Fases" icon={<EvaluationIcon className="w-5 h-5"/>}>
                 <ul className="space-y-1">
                    {Object.entries(PHASE_DESCRIPTIONS).map(([phase, { title, icon: Icon }]) => {
                        const phaseNum = parseInt(phase, 10) as LspPhase;
                        const isActive = currentPhase === phaseNum;
                        const isCompleted = currentPhase > phaseNum;

                        return (
                        <li key={phase} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 text-sm ${isActive ? 'bg-slate-700' : ''}`}>
                            <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive || isCompleted ? 'text-blue-400' : 'text-slate-500'}`} />
                            <span className={`${isActive ? 'text-white' : 'text-slate-300'}`}>{title}</span>
                        </li>
                        );
                    })}
                </ul>
            </CollapsibleSection>

            {/* Model Gallery Section */}
            {models.length > 0 && (
                <CollapsibleSection title="Galería de Modelos" icon={<GalleryIcon className="w-5 h-5"/>}>
                    <div className="grid grid-cols-3 gap-2">
                        {models.map(model => (
                            <div key={model.id} className="group relative">
                                <img src={`data:${model.mimeType};base64,${model.base64}`} alt={model.modelTitle} className="w-full h-16 object-cover rounded"/>
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-xs text-white text-center leading-tight">{model.modelTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Insights Section */}
             {insights.length > 0 && (
                <CollapsibleSection title="Insights Clave" icon={<InsightsIcon className="w-5 h-5"/>}>
                    <ul className="space-y-2">
                        {insights.map(insight => (
                             <li key={insight.id} className="text-xs text-slate-300 border-l-2 border-yellow-400 pl-3 py-1">
                                {insight.parts.map(p => p.text).join(' ').substring(0, 100)}...
                             </li>
                        ))}
                    </ul>
                </CollapsibleSection>
            )}
        </div>

        <div className="mt-auto pt-4 text-xs text-slate-500 border-t border-slate-700">
            <button onClick={onCopyChat} className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 mb-2">
                <CopyIcon className="w-4 h-4" />
                <span>{isCopied ? '¡Copiado!' : 'Copiar Chat'}</span>
            </button>
            <p className="text-center">Facilitador de LEGO® Serious Play®</p>
        </div>
    </div>
    );
};

export default Sidebar;