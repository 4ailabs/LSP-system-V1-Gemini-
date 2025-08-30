export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface MessagePart {
  text?: string;
  image?: {
    base64: string;
    mimeType: string;
    modelTitle?: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  isInsight?: boolean;
}

export enum LspPhase {
  IDENTIFICATION = 1,
  PROTOCOL_DEVELOPMENT = 2,
  IMPLEMENTATION = 3,
  INSIGHT_DISCOVERY = 4,
  STRATEGY_DEVELOPMENT = 5,
  EVALUATION = 6,
}

export interface Session {
    id: string;
    name: string;
    messages: Message[];
    currentPhase: LspPhase;
    createdAt: number;
}
