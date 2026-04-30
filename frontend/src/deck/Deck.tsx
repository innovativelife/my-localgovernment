import { useState, useEffect, useRef } from 'react';
import './Deck.css';
import DeckChrome from './DeckChrome';
import Slide01Hook from './slides/Slide01Hook';
import Slide02Problem from './slides/Slide02Problem';
import Slide03Solution from './slides/Slide03Solution';
import Slide04Coverage from './slides/Slide04Coverage';
import Slide05Demo from './slides/Slide05Demo';
import Slide06Moat from './slides/Slide06Moat';
import Slide07BusinessModel from './slides/Slide07BusinessModel';
import Slide09Title from './slides/Slide09Title';

const slides = [
  Slide01Hook,
  Slide02Problem,
  Slide03Solution,
  Slide04Coverage,
  Slide05Demo,
  Slide06Moat,
  Slide07BusinessModel,
  Slide09Title,
];

interface DeckProps {
  onExit: () => void;
}

export default function Deck({ onExit }: DeckProps) {
  const [current, setCurrent] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const goTo = (index: number) => {
    setCurrent(Math.max(0, Math.min(slides.length - 1, index)));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Don't intercept if focus is inside the prototype embed
      const embed = document.querySelector('[data-prototype-embed]');
      if (embed && embed.contains(e.target as Node)) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goTo(current - 1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(slides.length - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, onExit]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if click is inside the prototype embed
    const embed = (e.currentTarget as HTMLElement).querySelector('[data-prototype-embed]');
    if (embed && embed.contains(e.target as Node)) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) {
      goTo(current - 1);
    } else if (x > rect.width * 0.75) {
      goTo(current + 1);
    }
  };

  const SlideComponent = slides[current];

  return (
    <div className="deck-root" ref={rootRef}>
      <DeckChrome
        current={current}
        total={slides.length}
        onPrev={() => goTo(current - 1)}
        onNext={() => goTo(current + 1)}
      />
      <div
        className="deck-stage"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SlideComponent />
      </div>
    </div>
  );
}
