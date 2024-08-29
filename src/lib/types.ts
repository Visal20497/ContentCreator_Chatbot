import { ReactNode } from "react";

export type ResponsePattern = {
  messageId: string;
  roomId: string;
  response: string;
  numberOfTokensInPrompt: number;
  numberOfTokensInResponse: number;
};

export type MessagePattern = {
  id: string;
  isUserMessage: boolean;
  createdAt: string;
  text: ReactNode;
  source?: string[];
};
export interface ResultDocsFromVectorDB {
  fileName: string;
  fileSize: number;
  lastModified: string;
}
export interface VectorDatabaseQueryResult {
  Score: number;
  Source: string;
  Modality: string;
  Divider: string;
  Part: string;
  Tokens: number;
  Content: string;
}

export interface ChatRoomType {
  ROOM_ID: string;
  ROOM_CONTEXT?: string;
  ROOM_NAME: string;
  MODEL_ID: string;
  DATE_CREATED: string;
}

export interface OpenRoomType {
  name?: null;
  core_engine?: null;
  core_engine_id?: null;
  recipe?: null[] | null;
  params?: null;
  additionalPixels?: null;
  insightData: InsightData;
}
export interface InsightData {
  insightID: string;
  pixelReturn?: null[] | null;
}

export interface GetRoomMessagesType {
  MESSAGE_DATA: string;
  DATE_CREATED: string;
  MESSAGE_ID: string;
  MESSAGE_TYPE: string;
}
