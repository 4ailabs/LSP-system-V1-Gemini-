

import React, { useState, useRef, useEffect } from 'react';
import { Session, LspPhase, MessagePart, Message } from '../types';
import { PHASE_DESCRIPTIONS } from '../constants';
// Fix: Import `EvaluationIcon` to be used for the "Fases" section icon.
// Fix: Removed `CheckCircle2` as it's not exported from `icons.tsx`. `EvaluationIcon` is the correct component.
import { 
    Logo, CopyIcon, PlusIcon, EditIcon, TrashIcon, SaveIcon, CancelIcon, 
    ChevronDownIcon, GalleryIcon, InsightsIcon, EvaluationIcon
} from './icons';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onCopyChat: () => void;
  isCopied: boolean;
  activeSession: Session | undefined;
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

const SessionListItem: React.FC<{
    session: Session;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
}> = ({ session, isActive, onSelect, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(session.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (name.trim()) {
            onRename(name.trim());
        }
        setIsEditing(false);
    };

    return (
        <li className={`group flex items-center justify-between text-sm rounded transition-colors ${isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}>
            {isEditing ? (
                <div className="flex items-center w-full p-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="bg-slate-600 text-white rounded px-2 py-1 w-full"
                    />
                    <button onClick={handleRename} className="p-1 text-slate-300 hover:text-white"><SaveIcon className="w-4 h-4" /></button>
                    <button onClick={() => setIsEditing(false)} className="p-1 text-slate-300 hover:text-white"><CancelIcon className="w-4 h-4" /></button>
                </div>
            ) : (
                <button onClick={onSelect} className="flex-1 text-left p-2 truncate">
                    {session.name}
                </button>
            )}
            {!isEditing && (
                 <div className="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} className="p-1 text-slate-300 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
            )}
        </li>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onNewSession, onSelectSession, onDeleteSession, onRenameSession, onCopyChat, isCopied, activeSession }) => {
    const models = activeSession?.messages
        .flatMap(m => m.parts)
        .filter((part): part is MessagePart & { image: NonNullable<MessagePart['image']> } => !!part.image)
        .map((part, index) => ({ ...part.image, id: `${activeSession.id}-model-${index}` })) || [];
    
    const insights = activeSession?.messages.filter(m => m.isInsight) || [];

    return (
    <div className="w-80 h-screen bg-slate-800 text-white p-4 flex flex-col fixed top-0 left-0">
        <div className="flex items-center space-x-3 mb-6 px-2">
            <Logo />
            <h1 className="text-xl font-bold">LSP Insight System</h1>
        </div>
      
        <div className="flex-1 overflow-y-auto space-y-4 -mr-2 pr-2">
            {/* Sessions Section */}
            <CollapsibleSection title="Mis Sesiones" icon={<PlusIcon className="w-5 h-5"/>}>
                <ul className="space-y-1">
                    {sessions.map(session => (
                        <SessionListItem 
                            key={session.id}
                            session={session}
                            isActive={session.id === activeSessionId}
                            onSelect={() => onSelectSession(session.id)}
                            onDelete={() => onDeleteSession(session.id)}
                            onRename={(newName) => onRenameSession(session.id, newName)}
                        />
                    ))}
                </ul>
                <button onClick={onNewSession} className="w-full flex items-center space-x-2 text-sm mt-2 p-2 rounded text-slate-300 hover:bg-slate-700/50 hover:text-white">
                    <PlusIcon className="w-4 h-4" />
                    <span>Nueva Sesión</span>
                </button>
            </CollapsibleSection>

            {/* Phases Section */}
            {/* Fix: Replace undefined `CheckCircle2` component with the imported `EvaluationIcon` component. */}
            <CollapsibleSection title="Fases" icon={<EvaluationIcon className="w-5 h-5"/>}>
                 <ul className="space-y-1">
                    {Object.entries(PHASE_DESCRIPTIONS).map(([phase, { title, icon: Icon }]) => {
                        const phaseNum = parseInt(phase, 10) as LspPhase;
                        const isActive = activeSession?.currentPhase === phaseNum;
                        const isCompleted = activeSession?.currentPhase ?? 0 > phaseNum;

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