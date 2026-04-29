import { useState } from 'react';
import type { ActionCard as ActionCardType } from '../types';
import { submitReport } from '../api/client';

interface ActionCardProps {
  card: ActionCardType;
  councilId: string;
  sessionId: string;
}

export default function ActionCard({ card, councilId, sessionId }: ActionCardProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAttachment = () => showToast('Coming soon');

  const handleSubmit = async () => {
    try {
      await submitReport({
        councilId,
        sessionId,
        scenarioType: card.type,
        fields: card.fields,
      });
      setSubmitted(true);
      showToast('Submitted successfully');
    } catch {
      showToast('Submission failed');
    }
  };

  return (
    <>
      <div className="action-card">
        <div className="ac-header">
          <span className="ac-tag">{card.tag}</span>
          <span className="ac-source">{card.source}</span>
        </div>

        {card.type === 'report' && (
          <div className="ac-map"><div className="ac-pin" /></div>
        )}

        <div className="ac-fields">
          {card.fields.map(f => (
            <div className="ac-field" key={f.key}>
              <span className="k">{f.key}</span>
              <span className="v">
                {f.value || '—'}
                {f.verified && <span className="check">✓</span>}
              </span>
            </div>
          ))}
        </div>

        {card.attachments.length > 0 && (
          <div className="ac-attach">
            {card.attachments.includes('photo') && (
              <button onClick={handleAttachment}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Add photo
              </button>
            )}
            {card.attachments.includes('note') && (
              <button onClick={handleAttachment}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Add note
              </button>
            )}
          </div>
        )}

        {card.submitLabel && (
          <button className="ac-submit" onClick={handleSubmit} disabled={submitted}>
            {submitted ? 'Submitted ✓' : card.submitLabel}
            {!submitted && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
