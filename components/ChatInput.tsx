import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PaperclipIcon, SendIcon, LoadingSpinner, MicrophoneIcon, StopCircleIcon } from './icons';

// Fix for SpeechRecognition types. This is a browser API that may not be in default TS types.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface ChatInputProps {
  onSendMessage: (
    text: string, 
    imageData?: string
  ) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modelTitle, setModelTitle] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = true;
      recognition.continuous = true;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setText(finalTranscript);
      };
      
      speechRecognitionRef.current = recognition;
    }

    return () => {
        speechRecognitionRef.current?.stop();
    };
  }, []);
  
  const handleMicClick = () => {
    if (!speechRecognitionRef.current) {
        alert("Lo siento, el reconocimiento de voz no es compatible con este navegador.");
        return;
    }
    
    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      speechRecognitionRef.current.start();
    }
  };


  const fileToBase64 = useCallback((file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);
  
  const resetImageState = () => {
    setImage(null);
    setImagePreview(null);
    setModelTitle('');
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("📁 File selected:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const { base64, mimeType } = await fileToBase64(file);
      console.log("🖼️ File converted to base64:", {
        hasBase64: !!base64,
        base64Length: base64?.length,
        mimeType: mimeType
      });
      
      setImage({ base64, mimeType });
      setImagePreview(URL.createObjectURL(file));
    }
  }, [fileToBase64]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!text.trim() && !image)) return;

    console.log("📤 Submitting message with:", {
      text: text.trim(),
      hasImage: !!image,
      imageInfo: image ? {
        hasBase64: !!image.base64,
        base64Length: image.base64?.length,
        mimeType: image.mimeType,
        modelTitle: modelTitle
      } : null
    });

    onSendMessage(text, image?.base64);
    
    setText('');
    resetImageState();

    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="bg-white dark:bg-slate-800 px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-slate-200 dark:border-slate-600">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {imagePreview && (
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-700 rounded-t-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-start border border-slate-200 dark:border-slate-600 shadow-sm mb-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 p-1 border-2 border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-600 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={resetImageState}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs shadow-md transition-colors"
                    aria-label="Remove image"
                  >
                    X
                  </button>
                </div>
                <div className="flex-1 w-full">
                    <input 
                        type="text"
                        value={modelTitle}
                        onChange={(e) => setModelTitle(e.target.value)}
                        placeholder="Dale un título a tu modelo..."
                        className="w-full bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-slate-500"
                    />
                </div>
            </div>
          )}
          <div className={`flex items-end p-4 sm:p-6 bg-white dark:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-600 ${imagePreview ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 sm:p-3 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
              disabled={isLoading || isListening}
              aria-label="Attach file"
            >
              <PaperclipIcon />
            </button>
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2.5 sm:p-3 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'} transition-colors`}
              disabled={isLoading}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <StopCircleIcon /> : <MicrophoneIcon />}
            </button>
            {isListening ? (
                <div className="px-6 py-4 text-slate-600 dark:text-slate-300 text-base w-full flex-1 font-medium">
                    Escuchando...
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje o describe tu modelo..."
                    className="flex-1 bg-transparent px-6 py-4 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-none max-h-32 text-sm font-medium leading-relaxed"
                    rows={1}
                    disabled={isLoading}
                />
            )}
            <button
              type="submit"
              className="p-2.5 sm:p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-md"
              disabled={isLoading || (!text.trim() && !image)}
              aria-label="Send message"
            >
              {isLoading ? <LoadingSpinner /> : <SendIcon />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
