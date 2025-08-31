import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Edit3, Plus } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadImage: (sessionId: string, title: string, imageData: string) => void;
  sessions: Array<{
    id: string;
    name: string;
    currentPhase: number;
    createdAt: number;
  }>;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadImage,
  sessions
}) => {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo de imagen válido:\n\n• PNG (con transparencia)\n• JPG/JPEG (fotos)\n• GIF (animaciones)\n• WebP (moderno)');
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedSession || !imageTitle || !imageFile) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        // Llamar a la función de subida
        await onUploadImage(selectedSession, imageTitle, imageData);
        
        // Limpiar formulario
        setSelectedSession('');
        setImageTitle('');
        setImageFile(null);
        setImagePreview('');
        setIsUploading(false);
        onClose();
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setIsUploading(false);
      alert('Error al subir la imagen');
    }
  };

  const handleClose = () => {
    setSelectedSession('');
    setImageTitle('');
    setImageFile(null);
    setImagePreview('');
    onClose();
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Subir Foto a la Galería
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selección de sesión */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Seleccionar Sesión
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una sesión</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} - {getPhaseName(session.currentPhase)} ({formatDate(session.createdAt)})
                </option>
              ))}
            </select>
          </div>

          {/* Título de la imagen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Título del Modelo
            </label>
            <input
              type="text"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Ej: Mi primer modelo, Solución al problema, etc."
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subida de imagen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Seleccionar Imagen
            </label>
            
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                <Upload size={48} className="text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
                  Haz clic para seleccionar una imagen
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500 text-center space-y-1">
                  <p><strong>Formatos soportados:</strong></p>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">PNG</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">JPG</span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">GIF</span>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">WebP</span>
                  </div>
                  <p className="mt-2">Tamaño máximo: <strong>10MB</strong></p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {imageFile?.type === 'image/png' && 'PNG'}
                  {imageFile?.type === 'image/jpeg' && 'JPEG'}
                  {imageFile?.type === 'image/jpg' && 'JPG'}
                  {imageFile?.type === 'image/gif' && 'GIF'}
                  {imageFile?.type === 'image/webp' && 'WebP'}
                  {' • '}
                  {(imageFile?.size / 1024 / 1024).toFixed(1)}MB
                </div>
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedSession || !imageTitle || !imageFile || isUploading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Subir a la Galería</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
