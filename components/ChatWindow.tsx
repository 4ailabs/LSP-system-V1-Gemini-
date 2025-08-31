import React from 'react';
import Message from './Message';

interface Message {
  id: string;
  role: string;
  content: string;
  isInsight: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  currentPhase: number;
  onToggleInsight: (messageId: string) => void;
  onCopyMessage: (messageId: string) => void;
  onToggleSpeech: (messageId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  currentPhase,
  onToggleInsight,
  onCopyMessage,
  onToggleSpeech
}) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">LSP</span>
            </div>
          </div>
          
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            LEGO® Serious Play®
          </h1>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Tu facilitador especializado en metodología LSP. Escribe tu mensaje para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Mensajes */}
        <div className="space-y-3 sm:space-y-6">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onToggleInsight={onToggleInsight}
              onCopyMessage={onCopyMessage}
              onToggleSpeech={onToggleSpeech}
            />
          ))}
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 sm:py-6 lg:py-8">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white dark:bg-slate-800 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">
                Gemini está pensando...
              </span>
            </div>
          </div>
        )}

        {/* Espacio al final para scroll - móvil necesita menos espacio */}
        <div className="h-16 sm:h-20 lg:h-24"></div>
      </div>
    </div>
  );
};

export default ChatWindow;
