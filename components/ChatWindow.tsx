import React, { useRef, useEffect } from 'react';
import MessageComponent from './Message';
import { Logo, BrickIcon } from './icons';
import { Target, Blocks, Lightbulb } from 'lucide-react';

interface ChatWindowProps {
  messages: Array<{
    id: string;
    role: string;
    content: string;
    isInsight?: boolean;
  }>;
  isLoading: boolean;
  currentPhase: number;
  onToggleInsight: (messageId: string) => void;
  onCopyMessage: (message: any) => void;
  onToggleSpeech: (message: any) => void;
}

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
            <Logo />
        </div>
        
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-4">
                    Bienvenido al LSP Insight System
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-white leading-relaxed font-medium">
                    Tu facilitador especializado en LEGO® Serious Play®
                </p>
            </div>
            
            <p className="text-base sm:text-lg text-slate-700 dark:text-white leading-relaxed max-w-lg">
                Estoy aquí para guiarte en tu sesión de descubrimiento y reflexión profunda. 
                Para comenzar, cuéntame un poco sobre el tema que te gustaría explorar hoy.
            </p>
        </div>
    </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  isLoading, 
  currentPhase, 
  onToggleInsight, 
  onCopyMessage, 
  onToggleSpeech 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-900"
    >
      <div className="max-w-5xl mx-auto h-full">
        {messages.length === 0 && !isLoading ? (
            <WelcomeScreen />
        ) : (
            messages.map((msg) => (
                <MessageComponent 
                  key={msg.id} 
                  message={msg}
                  isInsight={msg.isInsight}
                  isCopied={false}
                  isSpeaking={false}
                  onToggleInsight={onToggleInsight}
                  onCopyMessage={onCopyMessage}
                  onToggleSpeech={onToggleSpeech}
                />
            ))
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4 sm:gap-6 my-6 sm:my-8">
              <div className="w-8 h-8 flex-shrink-0" />
              <div className="p-4 sm:p-6 rounded-2xl max-w-lg bg-white dark:bg-slate-800 rounded-bl-none flex items-center space-x-3 shadow-md border border-slate-200 dark:border-slate-600">
                  <div className="w-3 h-3 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
