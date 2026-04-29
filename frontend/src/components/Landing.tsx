import BrandMark from './BrandMark';
import TypingHero from './TypingHero';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="landing">
      <div className="topbar">
        <BrandMark />
        <div className="live">Live · River City</div>
      </div>
      <div className="label">Your patch, in plain words</div>
      <TypingHero />
      <p className="tagline">
        Every council in <strong>ANZ &amp; the UK</strong>. One place to ask. We do the rest.
      </p>
      <div className="cta-wrap">
        <button className="cta" onClick={onStart}>
          <span>Start asking</span>
          <span className="arrow-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
      <div className="meta">No login · Free · Powered by your council</div>
    </div>
  );
}
