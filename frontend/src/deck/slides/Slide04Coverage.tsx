import Logo from '../Logo';

export default function Slide04Coverage() {
  return (
    <div className="slide s5">
      <div className="glow-tl"></div>
      <span className="corner tl">04 · Coverage</span>
      <div className="content">
        <h2 className="s-headline" style={{ marginBottom: '5vmin' }}>
          <Logo className="inline-head" /> meets <em>every council</em> where they are.
        </h2>
        <div className="grid">
          <div className="col premium">
            <div className="chip">TechnologyOne councils</div>
            <h3 className="col-title">The <em>premium</em> experience</h3>
            <ul>
              <li>Seamless handoff to <em>Guide for Citizen</em></li>
              <li>Branding and configuration of their <Logo className="inline-body" />  experience</li>
              <li>Deep integrations</li>
              <li>Priority routing &amp; real-time status</li>
            </ul>
          </div>
          <div className="col">
            <div className="chip">Non-T1 councils</div>
            <h3 className="col-title">Basic listing, with an <em>obvious upgrade path</em></h3>
            <ul>
              <li>Lightweight  workflows</li>
              <li>Generic branding</li>
              <li>Deeplinks to council website</li>
              <li>Displacing point solutions (Snap-Send-Solve)</li>
            </ul>
          </div>
        </div>
        <div className="footnote">Every interaction with a non-T1 council is <em>a sales conversation we didn't have before.</em></div>
      </div>
    </div>
  );
}
