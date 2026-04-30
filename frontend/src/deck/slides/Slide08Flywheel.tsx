export default function Slide08Flywheel() {
  return (
    <div className="slide s9">
      <div className="glow-tl"></div>
      <span className="corner tl">08 · The Flywheel</span>
      <div className="content">
        <div className="top">
          <h2 className="headline">Every loop makes the next loop <em>easier.</em></h2>
        </div>
        <div className="wheel-wrap">
          <svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="hub" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#DCFF54" stopOpacity="0.3"></stop>
                <stop offset="70%" stopColor="#DCFF54" stopOpacity="0.05"></stop>
                <stop offset="100%" stopColor="#DCFF54" stopOpacity="0"></stop>
              </radialGradient>
            </defs>

            {/* center glow + logo */}
            <circle cx="450" cy="230" r="120" fill="url(#hub)"></circle>
            <image href="/guidepost-logo.svg" x="315" y="210" width="270" height="40" />


            {/* Node 1: TOP - "More councils on platform" */}
            <g>
              <rect x="350" y="20" width="200" height="60" rx="30" fill="rgba(255,255,255,0.04)" stroke="rgba(220,255,84,0.4)" strokeWidth="1"></rect>
              <text x="450" y="46" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">More councils</text>
              <text x="450" y="64" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">on platform</text>
            </g>

            {/* Node 2: TOP-RIGHT - "Richer agent" */}
            <g>
              <rect x="540" y="146" width="180" height="60" rx="30" fill="rgba(255,255,255,0.04)" stroke="rgba(220,255,84,0.4)" strokeWidth="1"></rect>
              <text x="630" y="172" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">Richer agent</text>
              <text x="630" y="190" fontFamily="Geist, sans-serif" fontSize="11" fill="rgba(250,250,245,0.55)" textAnchor="middle">more data, better answers</text>
            </g>

            {/* Node 3: BOTTOM-RIGHT - "More citizens use it" */}
            <g>
              <rect x="455" y="342" width="200" height="60" rx="30" fill="rgba(255,255,255,0.04)" stroke="rgba(220,255,84,0.4)" strokeWidth="1"></rect>
              <text x="555" y="368" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">More citizens</text>
              <text x="555" y="386" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">use it</text>
            </g>

            {/* Node 4: BOTTOM-LEFT - "More ad inventory" */}
            <g>
              <rect x="245" y="342" width="200" height="60" rx="30" fill="rgba(255,255,255,0.04)" stroke="rgba(220,255,84,0.4)" strokeWidth="1"></rect>
              <text x="345" y="368" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">More ad inventory</text>
              <text x="345" y="386" fontFamily="Geist, sans-serif" fontSize="11" fill="rgba(250,250,245,0.55)" textAnchor="middle">local businesses pay</text>
            </g>

            {/* Node 5: TOP-LEFT - "More value to councils" */}
            <g>
              <rect x="180" y="146" width="200" height="60" rx="30" fill="rgba(255,255,255,0.04)" stroke="rgba(220,255,84,0.4)" strokeWidth="1"></rect>
              <text x="280" y="172" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">More value</text>
              <text x="280" y="190" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="600" fill="#fafaf5" textAnchor="middle">to councils</text>
            </g>
          </svg>
        </div>
        <div className="pullout">The moat isn't the model. <em>It's the back-end integrations we already own.</em></div>
      </div>
    </div>
  );
}
