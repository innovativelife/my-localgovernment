export interface ActionCardField {
  key: string;
  value: string;
  verified: boolean;
}

export interface ActionCard {
  type: 'report' | 'lookup' | 'complaint' | 'registration';
  tag: string;
  source: string;
  fields: ActionCardField[];
  attachments: string[];
  submitLabel: string;
}

export interface ChatResponse {
  message: string;
  actionCard: ActionCard | null;
  quickChips: string[];
  action?: string;
  executeAction?: string;
}

export interface ChatRequest {
  councilId: string;
  message: string;
  sessionId?: string;
}

export interface ReportRequest {
  councilId: string;
  sessionId: string;
  scenarioType: string;
  fields: ActionCardField[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionCard?: ActionCard | null;
  quickChips?: string[];
}
