import React, { useState } from 'react';
import { Image, X, ChevronLeft, ChevronRight, Calendar, Clock, MessageSquare, Plus, Grid3X3, List } from 'lucide-react';
import GridGalleryView from './GridGalleryView';

interface SessionImage {
  id: string;
  title: string;
  imageData: string;
  createdAt: number;
}

interface Session {
  id: string;
  name: string;
  currentPhase: number;
  createdAt: number;
  images: SessionImage[];
  messageCount: number;
}

interface SessionGalleryProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onUploadImage: () => void;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({
  sessions,
  isOpen,
  onClose,
  onSelectSession,
  onUploadImage
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'grid'>('gallery');

  if (!isOpen) return null;

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setSelectedImageIndex(0);
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!selectedSession) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev > 0 ? prev - 1 : selectedSession.images.length - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev < selectedSession.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handleSelectImage = (sessionId: string, imageIndex: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setSelectedImageIndex(imageIndex);
      setViewMode('gallery');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhaseName = (phase: number) => {
    const phases = [
      'Identificación',
      'Protocolo',
      'Implementación',
      'Insights',
      'Estrategia',
      'Evaluación'
    ];
    return phases[phase - 1] || 'Desconocida';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Galería de Sesiones LSP
          </h2>
          <div className="flex items-center space-x-3">
            {/* Toggle de vista */}
            <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-3 py-2 transition-colors text-sm ${
                  viewMode === 'gallery'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <List size={16} />
                <span className="ml-1">Galería</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors text-sm ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <Grid3X3 size={16} />
                <span className="ml-1">Grid</span>
              </button>
            </div>

            <button
              onClick={onUploadImage}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
            >
              <Plus size={16} />
              <span>Subir Foto</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {viewMode === 'grid' ? (
          // Vista de Grid
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <GridGalleryView
              sessions={sessions}
              onSelectImage={handleSelectImage}
              onSelectSession={onSelectSession}
            />
          </div>
        ) : (
          // Vista de Galería (original)
          <div className="flex h-[calc(90vh-120px)]">
            {/* Lista de sesiones */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-600 overflow-y-auto">
              <div className="p-4 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionSelect(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedSession?.id === session.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {session.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                        {getPhaseName(session.currentPhase)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={14} />
                        <span>{session.messageCount}</span>
                      </div>
                    </div>
                    
                    {session.images.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1">
                        <Image size={14} className="text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {session.images.length} modelo{session.images.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vista de imágenes */}
            <div className="flex-1 p-4">
              {selectedSession ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {selectedSession.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Fase: {getPhaseName(selectedSession.currentPhase)}</span>
                      <span>•</span>
                      <span>{selectedSession.images.length} modelo{selectedSession.images.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {selectedSession.images.length > 0 ? (
                    <div className="flex-1 flex items-center justify-center relative">
                      {/* Navegación de imágenes */}
                      {selectedSession.images.length > 1 && (
                        <>
                          <button
                            onClick={() => handleImageNavigation('prev')}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors z-10"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => handleImageNavigation('next')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors z-10"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Imagen actual */}
                      <div className="max-w-full max-h-full">
                        <img
                          src={selectedSession.images[selectedImageIndex].imageData}
                          alt={selectedSession.images[selectedImageIndex].title}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                      </div>

                      {/* Indicadores de imagen */}
                      {selectedSession.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {selectedSession.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === selectedImageIndex
                                  ? 'bg-blue-500'
                                  : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <Image size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Esta sesión no tiene modelos construidos aún</p>
                      </div>
                    </div>
                  )}

                  {/* Botón para ir a la sesión */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        onSelectSession(selectedSession.id);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Ir a esta sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Image size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Selecciona una sesión para ver sus modelos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionGallery;
