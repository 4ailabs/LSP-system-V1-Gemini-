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
    <div className="group flex items-start gap-4 my-6">
      {isUser ? (
        // Mensaje del usuario - alineado a la derecha
        <>
          <div className="flex-1" />
          <div className="max-w-3xl text-right">
            <p className="text-slate-800 dark:text-white leading-relaxed">{message.content}</p>
          </div>
          <UserIcon />
        </>
      ) : (
        // Respuesta de la IA - alineada a la izquierda
        <>
          <div className="w-8 h-8 flex-shrink-0" />
          <div className="max-w-3xl">
            <div className="text-slate-800 dark:text-white max-w-none">
              <div
                style={{
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}
                dangerouslySetInnerHTML={{ __html: marked.parse(message.content || '') }}
              />
            </div>
          </div>
          <div className="flex-1" />
        </>
      )}
      
      {/* Botones de acción */}
      <div className="flex flex-col items-center self-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        {!isUser && (
            <button
              onClick={() => onToggleSpeech(message)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={isSpeaking ? 'Pause reading' : 'Read message aloud'}
            >
            {isSpeaking ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;
