interface DeckChromeProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DeckChrome({ current, total, onPrev, onNext }: DeckChromeProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <>
      <div className="deck-progress">
        <div className="deck-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="deck-nav">
        <button className="deck-nav-btn" onClick={onPrev} disabled={current === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="deck-nav-counter">{current + 1} / {total}</span>
        <button className="deck-nav-btn" onClick={onNext} disabled={current === total - 1}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  );
}
