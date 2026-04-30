import { useState, useEffect } from 'react';

const phrases = [
  "Is my bin day tomorrow?",
  "There's a pothole on Boundary St",
  "I need to register my dog",
  "There's loud construction noise",
];

export default function TypingHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const speed = deleting ? 30 : 60;

    if (!deleting && charIndex === phrase.length) {
      const timeout = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }
    if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex(charIndex + (deleting ? -1 : 1));
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <div className="hero">
      <div className="quote">
        {phrases[phraseIndex].slice(0, charIndex)}
        <span className="cursor" />
      </div>
    </div>
  );
}
