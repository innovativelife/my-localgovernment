import Logo from '../Logo';

export default function Slide03Solution() {
  return (
    <div className="slide s4">
      <span className="corner tl">03 · The Solution</span>
      <div className="content s4-layout">
        <div className="s4-text">
          <h2 className="headline"><Logo className="md" /><br />One front door for every council in ANZ &amp; the UK.</h2>
          <div className="props">
            <div className="prop"><strong>Converse</strong>... using plain language, on phone or web, anywhere.</div>
            <div className="prop"><strong>It knows where you are</strong>... which council, road, web site, local rep.</div>
            <div className="prop"><strong>It gets you the help you need</strong>... reporting a problem, council policies, contact details.</div>
          </div>
          <div className="tagline">Country-wide reach. Council-specific answers.</div>
        </div>
        <img className="s4-signpost" src="/guidepost-signpost.svg" alt="" />
      </div>
    </div>
  );
}
