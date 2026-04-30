// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import PrototypeApp from './PrototypeApp';
import Deck from './deck/Deck';

type View = 'prototype' | 'deck';

export default function App() {
  const [view, setView] = useState<View>('prototype');
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (view === 'deck') return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'd' || e.key === 'D') {
        setShowHint(false);
        setView('deck');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view]);

  if (view === 'deck') {
    return <Deck onExit={() => setView('prototype')} />;
  }

  return (
    <>
      <PrototypeApp />
      {showHint && <div className="deck-hint">Press D for deck mode</div>}
    </>
  );
}
