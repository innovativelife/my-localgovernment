export default function Slide02Problem() {
  return (
    <div className="slide s3">
      <div className="glow-tl"></div>
      <span className="corner tl">02 · The Problem</span>
      <div className="content">
        <h2 className="s-headline">Local government is <em>fragmented by design.</em></h2>
        <div className="stats">
          <div className="stat">
            <div className="num">537</div>
            <div className="lbl">councils in Australia</div>
          </div>
          <div className="stat">
            <div className="num">317<span style={{ fontSize: '0.55em' }}>+</span></div>
            <div className="lbl">in the United Kingdom</div>
          </div>
          <div className="stat">
            <div className="num">78</div>
            <div className="lbl">in New Zealand</div>
          </div>
        </div>
        <p className="sub">Every citizen interacts with 2-3 of them across home, work, and travel. Each one has its own portal, terminology, rules, opening hours.</p>
        <div className="pullout">Citizens don't want to learn councils. They want outcomes.</div>
      </div>
    </div>
  );
}
