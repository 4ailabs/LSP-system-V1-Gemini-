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
    <div className="group flex items-start gap-6 my-8">
      {isUser ? (
        // Mensaje del usuario - alineado a la derecha
        <>
          <div className="flex-1" />
          <div className="max-w-3xl text-right">
            <p 
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              className="text-slate-800 dark:text-white leading-relaxed text-base font-medium"
            >
              {message.content}
            </p>
          </div>
          <UserIcon />
        </>
      ) : (
        // Respuesta de la IA - alineada a la izquierda
        <>
          <div className="w-8 h-8 flex-shrink-0" />
          <div className="max-w-4xl">
            <div className="text-slate-800 dark:text-white max-w-none">
              <div
                style={{
                  lineHeight: '1.8',
                  fontSize: '1rem',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-slate-800 prose-headings:dark:text-white prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-slate-700 prose-p:dark:text-slate-300 prose-strong:text-slate-800 prose-strong:dark:text-white prose-strong:font-semibold prose-ul:my-2 prose-li:my-1 prose-ol:my-2 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:dark:text-slate-400"
                dangerouslySetInnerHTML={{ __html: marked.parse(message.content || '', { breaks: true, gfm: true }) }}
              />
              
              {/* Iconos de acción abajo del texto generado */}
              <div className="flex items-center space-x-4 mt-6 opacity-80 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleInsight(message.id)}
                  className={`text-slate-400 hover:text-yellow-500 ${isInsight ? 'text-yellow-500' : ''} transition-colors`}
                  aria-label={isInsight ? 'Remove from insights' : 'Add to insights'}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCopyMessage(message)}
                  className={`text-slate-400 hover:text-slate-600 ${isCopied ? 'opacity-100' : ''} transition-colors`}
                  aria-label={isCopied ? 'Copied!' : 'Copy message'}
                  disabled={isCopied}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onToggleSpeech(message)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={isSpeaking ? 'Pause reading' : 'Read message aloud'}
                >
                  {isSpeaking ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1" />
        </>
      )}
    </div>
  );
};

export default MessageComponent;
