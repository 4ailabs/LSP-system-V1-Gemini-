// Servicio simplificado para Gemini API
// En producción, esto se conectará a la API real

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatResponse {
  text: string;
}

// Simulación de la API de Gemini para desarrollo
export const startChatSession = () => {
  let messageHistory: ChatMessage[] = [];
  
  return {
    sendMessageStream: async (message: { message: string }) => {
      // Simular respuesta de Gemini
      const response = `¡Hola! Soy tu facilitador de LEGO® Serious Play®. He recibido tu mensaje: "${message.message}". En producción, esto se conectaría a la API real de Gemini.`;
      
      // Simular streaming
      const chunks = response.split(' ').map((word, index) => ({
        text: word + (index < response.split(' ').length - 1 ? ' ' : ''),
        delay: index * 100
      }));
      
      return {
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, chunk.delay));
            yield chunk;
          }
        }
      };
    }
  };
};
