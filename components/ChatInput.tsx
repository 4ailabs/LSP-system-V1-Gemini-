import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, imageData?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      try {
        onSendMessage(message.trim(), imageData || undefined);
        setMessage('');
        setImageData(null);
        setImagePreview(null);
      } catch (error) {
        console.error('Error sending message:', error);
        // Mostrar error más amigable para móviles
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      // Validar tamaño (máximo 5MB para móviles)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageData(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Preview de imagen */}
        {imagePreview && (
          <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input principal */}
        <div className="flex items-end space-x-2 sm:space-x-3">
          {/* Botón de imagen */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 p-2 sm:p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <ImageIcon size={20} className="sm:w-5 sm:h-5" />
          </button>

          {/* Campo de texto */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="w-full p-3 sm:p-4 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={20} className="sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Información de ayuda para móviles */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          <p>💡 En móviles: Toca el icono de imagen para subir fotos</p>
          <p>📱 Máximo 5MB por imagen para mejor rendimiento</p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
