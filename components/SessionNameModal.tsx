import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Check } from 'lucide-react';

interface SessionNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  isEditing?: boolean;
}

export const SessionNameModal: React.FC<SessionNameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  isEditing = false
}) => {
  const [sessionName, setSessionName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSessionName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    if (sessionName.trim()) {
      setIsSaving(true);
      await onSave(sessionName.trim());
      onClose();
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEditing ? 'Editar nombre de sesión' : 'Nueva sesión LSP'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="mb-4">
            <label htmlFor="sessionName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre de la sesión
            </label>
            <input
              type="text"
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Exploración de estrategias de equipo"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              autoFocus
            />
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!sessionName.trim() || isSaving}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEditing ? 'Actualizar' : 'Crear'} Sesión</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">LSP</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Gestión de Sesiones
                </span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                <span className="text-blue-600 dark:text-blue-400 font-medium">4ailabs</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
