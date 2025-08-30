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
    <div className="flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
            <Logo />
        </div>
        
        <div className="space-y-8">
            {/* Título Principal */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                    LSP Insight System
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-white leading-relaxed font-medium">
                    Facilitador LEGO® Serious Play®
                </p>
            </div>
            
            {/* Descripción Estructurada */}
            <div className="text-left space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-600 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        ¿Qué es LEGO® Serious Play®?
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Una metodología innovadora que utiliza bricks LEGO® para facilitar la reflexión, 
                        comunicación y resolución de problemas en entornos profesionales y personales.
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Exploración profunda de ideas y desafíos</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Comunicación efectiva a través de modelos 3D</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Generación de insights y soluciones creativas</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-600 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        ¿Cómo funciona?
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Te guiaré a través de un proceso estructurado donde construirás modelos 
                        que representen tus ideas y descubrirás nuevas perspectivas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                            <h3 className="font-medium text-slate-800 dark:text-white mb-2">1. Identificación</h3>
                            <p className="text-slate-600 dark:text-slate-400">Define el tema a explorar</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                            <h3 className="font-medium text-slate-800 dark:text-white mb-2">2. Construcción</h3>
                            <p className="text-slate-600 dark:text-slate-400">Crea modelos con bricks</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                            <h3 className="font-medium text-slate-800 dark:text-white mb-2">3. Reflexión</h3>
                            <p className="text-slate-600 dark:text-slate-400">Analiza y comparte insights</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                            <h3 className="font-medium text-slate-800 dark:text-white mb-2">4. Acción</h3>
                            <p className="text-slate-600 dark:text-slate-400">Planea próximos pasos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-600 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        Comencemos
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        Para empezar, cuéntame un poco sobre el tema que te gustaría explorar hoy. 
                        ¿Hay alguna pregunta específica o desafío que te gustaría abordar?
                    </p>
                </div>
            </div>
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
            <>
              {messages.map((msg) => (
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
              ))}
              {/* Espacio al final para mejor visualización y scroll */}
              <div className="h-20 sm:h-24 md:h-32"></div>
            </>
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4 sm:gap-6 my-6 sm:my-8">
              <div className="w-8 h-8 flex-shrink-0" />
              <div className="p-3 sm:p-4 rounded-2xl max-w-lg bg-white dark:bg-slate-800 rounded-bl-none flex items-center space-x-2 shadow-md border border-slate-200 dark:border-slate-600">
                  <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
