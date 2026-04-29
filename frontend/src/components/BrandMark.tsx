export default function BrandMark() {
  return (
    <div className="brand-mark">
      <svg className="post-icon" viewBox="0 0 14 18" fill="none">
        <path d="M7 2v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 4h5l1.5 1.5L12 7H7" fill="currentColor" />
        <path d="M7 8.5H2L0.5 10L2 11.5H7" fill="currentColor" />
      </svg>
      Guidepost<span className="dot">.</span>
    </div>
  );
}
