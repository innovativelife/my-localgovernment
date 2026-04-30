import { useState, useRef } from 'react';
import BrandMark from './BrandMark';
import TypingHero from './TypingHero';
import Sheets from './Sheets';

interface LandingProps {
  onStart: (message: string) => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [text, setText] = useState('');
  const [councilName, setCouncilName] = useState('River City');
  const [showOverlay, setShowOverlay] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [showReps, setShowReps] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [address, setAddress] = useState('');
  const chipsRef = useRef<HTMLDivElement>(null);

  const scrollChips = (dir: number) => {
    chipsRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onStart(trimmed);
  };

  const handleAddressSubmit = () => {
    if (!address.trim()) return;
    setCouncilName('Redland City');
    setAddress('');
    setShowOverlay(false);
  };

  return (
    <div className="landing">
      <div className="topbar">
        <BrandMark />
        <div className="subheader">Every Council. One Front Door.</div>
      </div>
      <div className="council-section">
        <button className="council-btn" onClick={() => setShowOverlay(true)}>
          <span className="council-dot" />
          <span>{councilName}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <div className="carousel">
          <button className="carousel-arrow left" onClick={() => scrollChips(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="service-chips" ref={chipsRef}>
            <span className="service-chip" onClick={() => setShowReport(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Report
            </span>
            <span className="service-chip" onClick={() => setShowReps(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Rep
            </span>
            <span className="service-chip" onClick={() => setShowDev(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Development
            </span>
            <span className="service-chip" onClick={() => setShowBin(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18v12H3z"/><path d="M3 18l3-3h12l3 3"/></svg>
              Bin Collection
            </span>
            <span className="service-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contacts
            </span>
            <span className="service-chip" onClick={() => setShowWebView(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Website
            </span>
          </div>
          <button className="carousel-arrow right" onClick={() => scrollChips(1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div className="cta-wrap">
        <TypingHero />
        <div className="cta">
          <input
            className="cta-input"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="How can I help?"
          />
          <button className="arrow-btn" onClick={handleSubmit}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      {showOverlay && (
        <div className="council-sheet-backdrop" onClick={() => setShowOverlay(false)}>
          <div className="council-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>Change council</span>
              <button className="council-sheet-close" onClick={() => setShowOverlay(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              className="council-sheet-input"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddressSubmit()}
              placeholder="Enter address"
              autoFocus
            />
            <button className="council-sheet-submit" onClick={handleAddressSubmit}>
              Find my council
            </button>
          </div>
        </div>
      )}

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
        onReportSubmit={(desc) => onStart('Report: ' + desc)}
      />

      <div className="meta">
        <span className="meta-powered">
          Powered by
          <svg className="t1-logo" viewBox="0 0 709 176" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g fill="#fafaf5">
              <path d="M658.44 76.22v-17.68c11 0 19.95-8.95 19.95-19.95h17.68c0 20.75-16.88 37.63-37.63 37.63Z"/>
              <polygon points="633.4 58.5 615.43 98.06 599.59 58.5 584.58 58.5 607.45 115.62 592.98 147.46 608.29 147.46 648.71 58.5 633.4 58.5"/>
              <path d="M559.91 58.51v4.05c-5.1-3.48-11.27-5.52-17.9-5.52-17.55 0-31.83 14.28-31.83 31.83 0 17.55 14.28 31.83 31.83 31.83 6.63 0 12.79-2.04 17.9-5.52v2.67c0 9.37-7.63 17-17 17-7.36 0-14.4-2.75-19.82-7.73l-9.44 10.25c8 7.36 18.39 11.41 29.26 11.41 17.06 0 30.93-13.88 30.93-30.93v-59.34h-13.93Zm-17.9 48.26c-9.87 0-17.9-8.03-17.9-17.9 0-9.87 8.03-17.9 17.9-17.9 9.87 0 17.9 8.03 17.9 17.9 0 9.87-8.03 17.9-17.9 17.9Z"/>
              <rect x="411.19" y="26.97" width="13.93" height="94.34"/>
              <path d="M366.51 123.03c-18.19 0-33-14.8-33-33 0-18.19 14.8-33 33-33 18.19 0 33 14.8 33 33 0 18.19-14.8 33-33 33Zm0-52.06c-10.51 0-19.06 8.55-19.06 19.06 0 10.51 8.55 19.06 19.06 19.06 10.51 0 19.06-8.55 19.06-19.06 0-10.51-8.55-19.06-19.06-19.06Z"/>
              <path d="M470.05 57.04c-18.19 0-33 14.8-33 33 0 18.19 14.8 33 33 33 18.19 0 33-14.8 33-33 0-18.19-14.8-33-33-33Zm0 52.05c-10.51 0-19.06-8.55-19.06-19.06 0-10.51 8.55-19.06 19.06-19.06 10.51 0 19.06 8.55 19.06 19.06 0 10.51-8.55 19.06-19.06 19.06Z"/>
              <path d="M296.01 57.58c-6.12 0-11.83 1.82-16.61 4.93v-4.14h-13.93v62.94h13.93v-33.18c0-9.16 7.45-16.61 16.61-16.61 7.14 0 12.94 5.81 12.94 12.94v36.85h13.93v-36.85c0-14.82-12.06-26.88-26.88-26.88Z"/>
              <path d="M226.91 57.58c-6.12 0-11.83 1.82-16.61 4.93V26.97h-13.93v94.34h13.93v-33.18c0-9.16 7.45-16.61 16.61-16.61 7.14 0 12.94 5.81 12.94 12.94v36.85h13.93v-36.85c0-14.82-12.06-26.88-26.88-26.88Z"/>
              <path d="M161.02 123.03c-18.19 0-33-14.8-33-33s14.8-33 33-33c9.4 0 18.37 4.03 24.63 11.05l-10.4 9.27c-3.62-4.06-8.81-6.39-14.23-6.39-10.51 0-19.06 8.55-19.06 19.06 0 10.51 8.55 19.06 19.06 19.06 5.43 0 10.61-2.33 14.23-6.39l10.4 9.27c-6.26 7.02-15.24 11.05-24.63 11.05Z"/>
              <path d="M120.93 90.03c0-19.12-12.7-33-30.21-33-8.91 0-17.27 3.5-23.52 9.85-6.25 6.35-9.62 14.76-9.47 23.68.14 8.48 3.52 16.51 9.51 22.6 6 6.09 13.98 9.59 22.46 9.84.35.01.69.02 1.04.02 9.63 0 18.94-4.07 25.69-11.27l-10.17-9.53c-4.26 4.54-10.16 7.04-16.14 6.86-7.69-.23-14.35-5.24-17.11-12.08h47.92v-6.97Zm-47.96-6.97c.93-2.36 2.33-4.54 4.17-6.4 3.61-3.67 8.44-5.69 13.59-5.69 8.44 0 13.38 5.39 15.32 12.09h-33.07Z"/>
              <path d="M50.22 121.34c-20.75 0-37.63-16.88-37.63-37.63v-45.12h17.68v45.12c0 11 8.95 19.95 19.95 19.95v17.68Z"/>
            </g>
            <rect fill="#ffc226" x="678.39" y="76.26" width="17.68" height="45.05"/>
            <rect fill="#ffc226" x="30.27" y="58.54" width="19.95" height="17.68"/>
          </svg>
        </span>
      </div>
    </div>
  );
}
