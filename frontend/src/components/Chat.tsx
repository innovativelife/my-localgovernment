// frontend/src/components/Chat.tsx
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { sendMessage } from '../api/client';
import BrandMark from './BrandMark';
import InputBar from './InputBar';
import QuickChips from './QuickChips';
import Sheets from './Sheets';

interface ChatProps {
  onBack: () => void;
  initialMessage?: string;
}

const COUNCIL_ID = 'river-city';

export default function Chat({ onBack, initialMessage }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const threadRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const [showReport, setShowReport] = useState(false);
  const [showReps, setShowReps] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    threadRef.current?.scrollTo(0, threadRef.current.scrollHeight);
  }, [messages, loading]);

  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      handleSend(initialMessage);
    }
  }, []);

  const triggerAction = (action: string) => {
    switch (action) {
      case 'report': setShowReport(true); break;
      case 'rep': setShowReps(true); break;
      case 'development': setShowDev(true); break;
      case 'bin': setShowBin(true); break;
      case 'website': setShowWebView(true); break;
    }
  };

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setChips([]);
    setLoading(true);

    try {
      const response = await sendMessage({ councilId: COUNCIL_ID, message: text, sessionId });
      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: response.message,
        quickChips: response.quickChips,
      };
      setMessages(prev => [...prev, agentMsg]);
      setChips(response.quickChips);

      if (response.executeAction) {
        triggerAction(response.executeAction);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: 'Something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-view">
      <div className="nav">
        <button className="back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <BrandMark />
        <div className="loc">River City</div>
      </div>

      <div className="thread" ref={threadRef}>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.sender === 'user' ? (
              <div className="msg-user">{msg.text}</div>
            ) : (
              <>
                {/* PROTOTYPE ONLY: agent messages are server-controlled, not user-controlled */}
                <div className="msg-agent" dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>

      <QuickChips chips={chips} onSelect={handleSend} />
      <InputBar onSend={handleSend} disabled={loading} />

      <Sheets
        showReport={showReport}
        showReps={showReps}
        showDev={showDev}
        showBin={showBin}
        showWebView={showWebView}
        onCloseReport={() => setShowReport(false)}
        onCloseReps={() => setShowReps(false)}
        onCloseDev={() => setShowDev(false)}
        onCloseBin={() => setShowBin(false)}
        onCloseWebView={() => setShowWebView(false)}
      />
    </div>
  );
}
