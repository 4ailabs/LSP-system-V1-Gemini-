import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Lightbulb, 
  Image as ImageIcon,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Edit3
} from 'lucide-react';
import { LspPhase } from '../types';
import { PHASE_DESCRIPTIONS } from '../constants';
import { SessionNameModal } from './SessionNameModal';

interface SidebarProps {
  sessions: Array<{
    id: string;
    name: string;
    currentPhase: number;
    createdAt: number;
  }>;
  currentPhase: LspPhase;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    isInsight: boolean;
  }>;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onEditSessionName: (sessionId: string, newName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentPhase,
  messages,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onEditSessionName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{ id: string; name: string } | null>(null);

  // Calcular estadísticas
  const totalMessages = messages.length;
  const insights = messages.filter(msg => msg.isInsight);
  const images = messages.filter(msg => msg.content.includes('image'));

  const handleEditSession = (session: { id: string; name: string }) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSessionName = (newName: string) => {
    if (editingSession) {
      onEditSessionName(editingSession.id, newName);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  return (
    <>
      <div className="w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600 flex flex-col h-full">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            LSP Insight System
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Facilitador LEGO® Serious Play®
          </p>
        </div>

        {/* Sesiones */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Botón Nueva Sesión */}
          <button
            onClick={onNewSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md font-medium text-xs"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Nueva Sesión</span>
          </button>

          {/* Lista de Sesiones */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-white uppercase tracking-wide">
              Sesiones Activas
            </h3>
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-700 rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {session.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Fase {session.currentPhase} • {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSession(session);
                      }}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors"
                      title="Editar nombre"
                    >
                      <Edit3 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"
                      title="Eliminar sesión"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fases LSP */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-white uppercase tracking-wide">
              Fases LSP
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(PHASE_DESCRIPTIONS).map(([phaseKey, phase]) => {
                const phaseId = parseInt(phaseKey) as LspPhase;
                const isActive = phaseId === currentPhase;
                const isCompleted = phaseId < currentPhase;
                
                return (
                  <div
                    key={phaseKey}
                    className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors border ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white border-blue-200 dark:border-blue-700' 
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-white border-green-200 dark:border-green-700'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-white border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <Play size={14} className="sm:w-4 sm:h-4 text-blue-600 dark:text-white" />
                      ) : isCompleted ? (
                        <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-600 dark:text-white" />
                      ) : (
                        <Pause size={14} className="sm:w-4 sm:h-4 text-slate-500 dark:text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{phase.title}</p>
                      <p className="text-xs truncate opacity-80">{phase.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-white uppercase tracking-wide">
              Estadísticas
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <MessageSquare size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {totalMessages}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white mt-1 font-medium">Mensajes</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Lightbulb size={14} className="sm:w-4 sm:h-4 text-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {insights.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white mt-1 font-medium">Insights</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <ImageIcon size={14} className="sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {images.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white mt-1 font-medium">Modelos</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <CheckCircle size={14} className="sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {sessions.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white mt-1 font-medium">Sesiones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              LEGO® Serious Play®
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Powered by Gemini AI
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Powered by <span className="text-blue-600 dark:text-blue-400 font-semibold">4ailabs</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <SessionNameModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSessionName}
        initialName={editingSession?.name || ''}
      />
    </>
  );
};

export default Sidebar;
