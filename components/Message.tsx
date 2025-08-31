import React from 'react';
import { marked } from 'marked';
import { Star, Copy, Check, Volume2, PauseCircle, User } from 'lucide-react';

interface MessageProps {
  message: {
    id: string;
    role: string;
    content: string;
    isInsight?: boolean;
  };
  isInsight?: boolean;
  isCopied?: boolean;
  isSpeaking?: boolean;
  onToggleInsight: (messageId: string) => void;
  onCopyMessage: (message: any) => void;
  onToggleSpeech: (message: any) => void;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  isInsight = false,
  isCopied = false,
  isSpeaking = false,
  onToggleInsight,
  onCopyMessage,
  onToggleSpeech
}) => {
  const isUser = message.role === 'user';

  const UserIcon = () => (
    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
      <User className="w-4 h-4 text-white" />
    </div>
  );

  return (
    <div className="group flex items-start gap-3 sm:gap-6 my-4 sm:my-8">
      {isUser ? (
        // Mensaje del usuario - alineado a la derecha
        <>
          <div className="flex-1" />
          <div className="max-w-[85%] sm:max-w-3xl text-right">
            <div className="inline-block bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tr-sm">
              <p 
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                className="leading-relaxed text-sm sm:text-base font-medium"
              >
                {message.content}
              </p>
            </div>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </>
      ) : (
        // Respuesta de la IA - alineada a la izquierda
        <>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs sm:text-sm font-bold">LSP</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-800 dark:text-white">
              <div
                style={{
                  lineHeight: '1.7',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    const parsed = marked.parse(message.content || '', { 
                      breaks: true, 
                      gfm: true 
                    });
                    if (typeof parsed === 'string') {
                      return parsed.replace(
                        /<ol>/g, 
                        '<ol class="custom-list" style="list-style-type: decimal; margin-left: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">'
                      ).replace(
                        /<ul>/g, 
                        '<ul class="custom-bullet" style="list-style-type: disc; margin-left: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">'
                      ).replace(
                        /<li>/g, 
                        '<li style="margin-bottom: 0.25rem; line-height: 1.6;">'
                      ).replace(
                        /<p>/g,
                        '<p style="margin-bottom: 0.75rem; font-size: 0.875rem; line-height: 1.6;">'
                      ).replace(
                        /<h[1-6]>/g,
                        '<h$1 style="font-size: 1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;">'
                      );
                    }
                    return message.content || '';
                  })()
                }}
              />
              
              {/* Iconos de acción abajo del texto generado */}
              <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-6 opacity-70 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleInsight(message.id)}
                  className={`text-slate-400 hover:text-yellow-500 ${isInsight ? 'text-yellow-500' : ''} transition-colors p-2 rounded-lg touch-manipulation`}
                  aria-label={isInsight ? 'Remove from insights' : 'Add to insights'}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCopyMessage(message)}
                  className={`text-slate-400 hover:text-slate-600 ${isCopied ? 'opacity-100' : ''} transition-colors p-2 rounded-lg touch-manipulation`}
                  aria-label={isCopied ? 'Copied!' : 'Copy message'}
                  disabled={isCopied}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onToggleSpeech(message)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg touch-manipulation"
                  aria-label={isSpeaking ? 'Pause reading' : 'Read message aloud'}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {isSpeaking ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageComponent;
