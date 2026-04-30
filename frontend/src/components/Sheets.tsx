import { useState, useRef } from 'react';

interface SheetsProps {
  showReport: boolean;
  showReps: boolean;
  showDev: boolean;
  showBin: boolean;
  showWebView: boolean;
  onCloseReport: () => void;
  onCloseReps: () => void;
  onCloseDev: () => void;
  onCloseBin: () => void;
  onCloseWebView: () => void;
  onReportSubmit?: (description: string) => void;
}

export default function Sheets({
  showReport, showReps, showDev, showBin, showWebView,
  onCloseReport, onCloseReps, onCloseDev, onCloseBin, onCloseWebView,
  onReportSubmit,
}: SheetsProps) {
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReportPhoto(url);
    setTimeout(() => {
      setReportDescription('Pothole on road surface, approximately 30cm wide');
      setReportLocation('Boundary St, River City QLD 4000');
    }, 800);
  };

  const handleReportClose = () => {
    onCloseReport();
    setReportPhoto(null);
    setReportDescription('');
    setReportLocation('');
  };

  return (
    <>
      {showWebView && (
        <div className="council-sheet-backdrop" onClick={onCloseWebView}>
          <div className="council-sheet webview-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>brisbane.qld.gov.au</span>
              <button className="council-sheet-close" onClick={onCloseWebView}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="webview-frame">
              <div className="webview-url-bar">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>brisbane.qld.gov.au</span>
              </div>
              <div className="webview-content">
                <div className="webview-header-bar"></div>
                <div className="webview-hero"></div>
                <div className="webview-lines">
                  <div className="webview-line" style={{ width: '80%' }}></div>
                  <div className="webview-line" style={{ width: '65%' }}></div>
                  <div className="webview-line" style={{ width: '90%' }}></div>
                  <div className="webview-line" style={{ width: '45%' }}></div>
                </div>
                <div className="webview-cards">
                  <div className="webview-card"></div>
                  <div className="webview-card"></div>
                  <div className="webview-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="council-sheet-backdrop" onClick={handleReportClose}>
          <div className="council-sheet report-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>Report an issue</span>
              <button className="council-sheet-close" onClick={handleReportClose}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            {!reportPhoto ? (
              <button className="report-photo-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Take or select a photo</span>
                <span className="report-photo-hint">Photo location and AI will auto-fill details</span>
              </button>
            ) : (
              <div className="report-photo-preview">
                <img src={reportPhoto} alt="Report" />
              </div>
            )}

            <div className="report-field">
              <label className="report-field-label">Description</label>
              <div className="report-field-value">{reportDescription || <span className="report-field-placeholder">Auto-fills from photo...</span>}</div>
            </div>

            <div className="report-field">
              <label className="report-field-label">Location</label>
              <div className="report-field-value">{reportLocation || <span className="report-field-placeholder">Auto-fills from photo GPS...</span>}</div>
            </div>

            <button
              className="council-sheet-submit"
              disabled={!reportPhoto}
              onClick={() => { handleReportClose(); onReportSubmit?.(reportDescription); }}
            >
              Submit report
            </button>
          </div>
        </div>
      )}

      {showBin && (
        <div className="council-sheet-backdrop" onClick={onCloseBin}>
          <div className="council-sheet dev-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>Bin Collection</span>
              <button className="council-sheet-close" onClick={onCloseBin}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="dev-screenshot">
              <img src="/bin-collection-search.png" alt="Bin collection search" />
            </div>
            <a
              className="council-sheet-submit dev-open-btn"
              href="https://www.brisbane.qld.gov.au/search?q=bin%20collection"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open in browser
            </a>
          </div>
        </div>
      )}

      {showDev && (
        <div className="council-sheet-backdrop" onClick={onCloseDev}>
          <div className="council-sheet dev-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>Development Applications</span>
              <button className="council-sheet-close" onClick={onCloseDev}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="dev-screenshot">
              <img src="/development-search.png" alt="Development applications search" />
            </div>
            <a
              className="council-sheet-submit dev-open-btn"
              href="https://www.brisbane.qld.gov.au/search?q=Development"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open in browser
            </a>
          </div>
        </div>
      )}

      {showReps && (
        <div className="council-sheet-backdrop" onClick={onCloseReps}>
          <div className="council-sheet reps-sheet" onClick={e => e.stopPropagation()}>
            <div className="council-sheet-handle" />
            <div className="council-sheet-header">
              <span>Contact Central Ward Office</span>
              <button className="council-sheet-close" onClick={onCloseReps}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="reps-profile">
              <img src="/CentralWardRep.jpeg" alt="Councillor Vicki Howard" className="reps-photo" />
              <span className="reps-name">Councillor Vicki Howard</span>
            </div>
            <div className="reps-details">
              <div className="reps-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Suite 1, 5 Lamington Street, New Farm Qld 4005</span>
              </div>
              <div className="reps-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Mon – Fri, 9am – 5pm</span>
              </div>
              <div className="reps-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>07 3403 0254</span>
              </div>
              <div className="reps-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>Central Ward Office</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
