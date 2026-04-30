import Logo from '../Logo';

export default function Slide09Title() {
  return (
    <div className="slide s1">
      <div className="photo-bg dim"></div>
      <span className="corner tl">09 · Title</span>
      <span className="corner tr">Hack Day · 2026</span>
      <div className="content">
        <div className="wordmark"><Logo className="lg" /></div>
        <div className="tagline">Every council. <em>One front door.</em></div>
      </div>
    </div>
  );
}
