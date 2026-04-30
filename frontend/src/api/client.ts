import type { ChatRequest, ChatResponse } from '../types';
import { processMessage } from '../services/chatService';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  return processMessage(request);
}
