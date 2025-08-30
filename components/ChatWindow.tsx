import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';
import { Logo } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  speakingMessageId: string | null;
  onToggleSpeech: (message: Message) => void;
  copiedMessageId: string | null;
  onCopyMessage: (message: Message) => void;
  onToggleInsight: (messageId: string) => void;
}

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <Logo />
        <h1 className="text-2xl font-bold mt-4 text-slate-700 dark:text-slate-300">Bienvenido al LSP Insight System</h1>
        <p className="mt-2 max-w-md">
            Estoy aquí para guiarte en tu sesión de LEGO® Serious Play®. Para comenzar, cuéntame un poco sobre el tema que te gustaría explorar hoy.
        </p>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, speakingMessageId, onToggleSpeech, copiedMessageId, onCopyMessage, onToggleInsight }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6"
    >
      <div className="max-w-4xl mx-auto h-full">
        {messages.length === 0 && !isLoading ? (
            <WelcomeScreen />
        ) : (
            messages.map((msg) => (
                <MessageComponent 
                  key={msg.id} 
                  message={msg}
                  speakingMessageId={speakingMessageId}
                  onToggleSpeech={onToggleSpeech}
                  copiedMessageId={copiedMessageId}
                  onCopyMessage={onCopyMessage}
                  onToggleInsight={onToggleInsight}
                />
            ))
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4 my-6">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-md">AI</div>
              <div className="p-4 rounded-2xl max-w-lg bg-white dark:bg-slate-700 rounded-bl-none flex items-center space-x-2 shadow-sm">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
