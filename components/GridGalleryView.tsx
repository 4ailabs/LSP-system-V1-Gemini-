import React, { useState } from 'react';
import { Image, Search, Filter, Grid3X3, List, Eye, Calendar, MessageSquare } from 'lucide-react';

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

interface GridGalleryViewProps {
  sessions: Session[];
  onSelectImage: (sessionId: string, imageIndex: number) => void;
  onSelectSession: (sessionId: string) => void;
}

const GridGalleryView: React.FC<GridGalleryViewProps> = ({
  sessions,
  onSelectImage,
  onSelectSession
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  // Filtrar imágenes basado en búsqueda y filtros
  const filteredImages = sessions.flatMap(session => 
    session.images
      .filter(image => {
        const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            session.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSession = selectedSession === 'all' || session.id === selectedSession;
        const matchesPhase = selectedPhase === 0 || session.currentPhase === selectedPhase;
        
        return matchesSearch && matchesSession && matchesPhase;
      })
      .map(image => ({
        ...image,
        sessionName: session.name,
        sessionPhase: session.currentPhase,
        sessionId: session.id,
        messageCount: session.messageCount
      }))
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const getPhaseColor = (phase: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    ];
    return colors[phase - 1] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Controles de la galería */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título o sesión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las sesiones</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Todas las fases</option>
            {[1, 2, 3, 4, 5, 6].map((phase) => (
              <option key={phase} value={phase}>
                {getPhaseName(phase)}
              </option>
            ))}
          </select>
        </div>

        {/* Cambio de vista */}
        <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2">
            <Image className="text-blue-500" size={20} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Imágenes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredImages.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-green-500" size={20} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Sesiones</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2">
            <Calendar className="text-purple-500" size={20} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Última Imagen</span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {filteredImages.length > 0 ? formatDate(Math.max(...filteredImages.map(img => img.createdAt))) : 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2">
            <Filter className="text-orange-500" size={20} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Filtros Activos</span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {selectedSession !== 'all' || selectedPhase !== 0 ? 'Sí' : 'No'}
          </p>
        </div>
      </div>

      {/* Vista de imágenes */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <Image size={64} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {searchTerm || selectedSession !== 'all' || selectedPhase !== 0
              ? 'No se encontraron imágenes con los filtros aplicados'
              : 'No hay imágenes en la galería aún'
            }
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
            Intenta ajustar los filtros o subir una nueva imagen
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''
              }`}
            >
              {/* Imagen */}
              <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48'}`}>
                <img
                  src={image.imageData}
                  alt={image.title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const session = sessions.find(s => s.id === image.sessionId);
                    if (session) {
                      const imageIndex = session.images.findIndex(img => img.id === image.id);
                      onSelectImage(image.sessionId, imageIndex);
                    }
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(image.sessionPhase)}`}>
                    {getPhaseName(image.sessionPhase)}
                  </span>
                </div>
                <button
                  onClick={() => onSelectImage(image.sessionId, index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-90 transition-all"
                >
                  <Eye size={16} />
                </button>
              </div>

              {/* Información */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2">
                  {image.title}
                </h3>
                
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={14} />
                    <span>{image.sessionName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                </div>

                {/* Botón para ir a la sesión */}
                <button
                  onClick={() => onSelectSession(image.sessionId)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Ir a la Sesión
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridGalleryView;
