export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface MessagePart {
  text?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
}

export enum LspPhase {
  IDENTIFICATION = 1,
  PROTOCOL_DEVELOPMENT = 2,
  IMPLEMENTATION = 3,
  INSIGHT_DISCOVERY = 4,
  STRATEGY_DEVELOPMENT = 5,
  EVALUATION = 6,
}