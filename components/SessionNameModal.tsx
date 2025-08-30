import React, { useState, useEffect } from 'react';
import { X, Edit3, Save } from 'lucide-react';

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

  useEffect(() => {
    setSessionName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionName.trim()) {
      onSave(sessionName.trim());
      onClose();
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

        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!sessionName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isEditing ? (
                <>
                  <Edit3 size={16} />
                  <span>Actualizar</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Crear sesión</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
