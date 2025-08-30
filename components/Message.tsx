import React from 'react';
import { marked } from 'marked';
import { Message, Role } from '../types';
import { Volume2Icon, PauseCircleIcon, CopyIcon, CheckIcon, StarIcon } from './icons';

interface MessageProps {
  message: Message;
  speakingMessageId: string | null;
  onToggleSpeech: (message: Message) => void;
  copiedMessageId: string | null;
  onCopyMessage: (message: Message) => void;
  onToggleInsight: (messageId: string) => void;
}

const UserIcon = () => (
  <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
);

const ModelIcon = () => (
    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-md">
        AI
    </div>
);

const MessageComponent: React.FC<MessageProps> = ({ message, speakingMessageId, onToggleSpeech, copiedMessageId, onCopyMessage, onToggleInsight }) => {
  const isUser = message.role === Role.USER;
  const isSpeaking = speakingMessageId === message.id;
  const isCopied = copiedMessageId === message.id;
  const isInsight = message.isInsight;

  const renderModelText = (text: string) => {
    // Pre-procesar el texto para mejorar la legibilidad
    let processedText = text;
    
    // Agregar saltos de línea después de puntos seguidos de mayúsculas
    processedText = processedText.replace(/\. ([A-Z])/g, '.\n\n$1');
    
    // Agregar saltos de línea después de dos puntos
    processedText = processedText.replace(/: /g, ':\n\n');
    
    // Agregar saltos de línea antes de listas (líneas que empiezan con guiones o números)
    processedText = processedText.replace(/\n([•-]\s)/g, '\n\n$1');
    processedText = processedText.replace(/\n(\d+\.\s)/g, '\n\n$1');
    
    // Agregar saltos de línea antes de preguntas
    processedText = processedText.replace(/\n(\?)/g, '\n\n$1');
    
    // Agregar saltos de línea después de frases importantes
    processedText = processedText.replace(/([.!?])\s+([A-Z][a-z]+)/g, '$1\n\n$2');
    
    // Mejorar el formato de listas
    processedText = processedText.replace(/([•-])\s/g, '\n$1 ');
    processedText = processedText.replace(/(\d+\.)\s/g, '\n$1 ');
    
    // Agregar espacios antes de frases que empiezan con "Ahora", "Para", "Esto", etc.
    const importantWords = ['Ahora', 'Para', 'Esto', 'Además', 'También', 'Sin embargo', 'Por ejemplo', 'En resumen'];
    importantWords.forEach(word => {
      processedText = processedText.replace(new RegExp(`\\n(${word})`, 'g'), '\n\n$1');
    });
    
    // Procesar con marked para markdown
    const rawMarkup = marked.parse(processedText || '') as string;
    
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-headings:my-4 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm"
        style={{
          lineHeight: '1.7',
          fontSize: '0.95rem'
        }}
        dangerouslySetInnerHTML={{ __html: rawMarkup }}
      />
    );
  };

  return (
    <div className={`group flex items-start gap-4 my-6 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? <UserIcon /> : <ModelIcon />}
      <div
        className={`p-4 rounded-2xl max-w-2xl shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
        }`}
      >
        {message.parts.map((part, index) => (
          <div key={index}>
            {part.text && (
              isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
              ) : (
                <div className="leading-relaxed">
                  {renderModelText(part.text)}
                </div>
              )
            )}
            {part.image && (
              <div className="mt-2 flex flex-col gap-2">
                {part.image.modelTitle && <p className={`font-bold text-sm ${isUser ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>{part.image.modelTitle}</p>}
                <img
                  src={`data:${part.image.mimeType};base64,${part.image.base64}`}
                  alt={part.image.modelTitle || "User upload"}
                  className="rounded-lg max-w-xs"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center self-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleInsight(message.id)}
          className={`text-slate-400 hover:text-yellow-500 ${isInsight ? 'text-yellow-400' : ''}`}
          aria-label={isInsight ? 'Remove from insights' : 'Add to insights'}
        >
          <StarIcon className={`w-5 h-5 ${isInsight ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => onCopyMessage(message)}
          className={`text-slate-400 hover:text-blue-500 ${isCopied ? 'opacity-100' : ''}`}
          aria-label={isCopied ? 'Copied!' : 'Copy message'}
          disabled={isCopied}
        >
          {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
        </button>
        {!isUser && (
            <button
              onClick={() => onToggleSpeech(message)}
              className="text-slate-400 hover:text-blue-500"
              aria-label={isSpeaking ? 'Pause reading' : 'Read message aloud'}
            >
            {isSpeaking ? <PauseCircleIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
            </button>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;
