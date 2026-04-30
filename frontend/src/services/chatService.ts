import type { ChatRequest, ChatResponse } from '../types';

interface ActionDef {
  keywords: string[];
  confirmMessages: string[];
  executeMessages: string[];
}

const CONFIRM_CHIPS = ['Yes', 'Not right now'];

const DEFAULT_CHIPS = [
  'Report an issue', 'My local rep', 'Development applications', 'Bin collection', 'Council website'
];

const ACTIONS: Record<string, ActionDef> = {
  report: {
    keywords: ['report', 'pothole', 'issue'],
    confirmMessages: [
      'I can help you report that. Shall I open the report form?',
      "No problem, I'll get that lodged for you. Ready to proceed?",
      'Sure, I can help report that issue. Want me to go ahead?',
    ],
    executeMessages: [
      'Ok - That has been submitted to the council.  Is there anything else I can help with?',
      "Sent to council.  What's next?",
    ],
  },
  rep: {
    keywords: ['rep', 'councillor', 'representative', 'elected'],
    confirmMessages: [
      "I can pull up your local representative's details. Shall I?",
      "Sure, I can show you your councillor's contact info. Want me to proceed?",
      "I've got your local rep's details. Would you like to see them?",
    ],
    executeMessages: [
      'A good local rep can be such a big help!',
    ],
  },
  development: {
    keywords: ['development', 'planning', 'da ', 'building'],
    confirmMessages: [
      "Shall I search council's web site for development info?",
      "Want me to show you the council's web content on development?",
    ],
    executeMessages: [
      'Hope you got what you needed!',
    ],
  },
  bin: {
    keywords: ['bin', 'rubbish', 'waste', 'recycling', 'garbage', 'collection'],
    confirmMessages: [
      "Shall I search for bin info on the council's web site?",
    ],
    executeMessages: [
      'Did you get what you needed?  If not, you may want to contact your Local Rep.',
    ],
  },
  website: {
    keywords: ['website', 'site', 'web'],
    confirmMessages: [
      'I can open the council website for you. Shall I?',
      "Sure, I'll pull up the council site. Want me to go ahead?",
      'I can show you the council website. Ready?',
    ],
    executeMessages: [
      'Did you get what you needed?  If not, you may want to contact your Local Rep.',
    ],
  },
};

// Track pending action per session
const pendingActions = new Map<string, string>();

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function processMessage(request: ChatRequest): ChatResponse {
  const msg = request.message.toLowerCase().trim();
  const sessionId = request.sessionId ?? '';

  // Check if user is confirming a pending action
  if (msg === 'yes' && pendingActions.has(sessionId)) {
    const actionName = pendingActions.get(sessionId)!;
    pendingActions.delete(sessionId);
    const actionDef = ACTIONS[actionName];
    return {
      message: pick(actionDef.executeMessages),
      actionCard: null,
      quickChips: DEFAULT_CHIPS,
      executeAction: actionName,
    };
  }

  // Check if user is declining
  if (msg === 'not right now' && pendingActions.has(sessionId)) {
    pendingActions.delete(sessionId);
    return {
      message: 'No worries! Let me know if you need anything else.',
      actionCard: null,
      quickChips: DEFAULT_CHIPS,
    };
  }

  // Check for action keywords
  for (const [actionName, actionDef] of Object.entries(ACTIONS)) {
    if (actionDef.keywords.some(k => msg.includes(k))) {
      pendingActions.set(sessionId, actionName);
      return {
        message: pick(actionDef.confirmMessages),
        actionCard: null,
        quickChips: CONFIRM_CHIPS,
        action: actionName,
      };
    }
  }

  // Fallback
  return {
    message: "I'm not sure how to help with that yet. Here are some things I can do:",
    actionCard: null,
    quickChips: DEFAULT_CHIPS,
  };
}
