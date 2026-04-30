import { useState } from 'react';
import Landing from './components/Landing';
import Chat from './components/Chat';

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <span className="right">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 16h2v4H2v-4zm5-4h2v8H7v-8zm5-4h2v12h-2V8zm5-4h2v16h-2V4z" /></svg>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-1.45-.34C5.4 19.36 2 14.55 2 9.5 2 6.42 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.09C13.09 4.81 14.76 4 16.5 4 19.58 4 22 6.42 22 9.5c0 5.05-3.4 9.86-8.55 11.16L12 21z" /></svg>
        <span>100</span>
      </span>
    </div>
  );
}

export default function PrototypeApp() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [initialMessage, setInitialMessage] = useState('');

  const handleStart = (message: string) => {
    setInitialMessage(message);
    setView('chat');
  };

  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="screen">
          <StatusBar />
          {view === 'chat'
            ? <Chat onBack={() => setView('landing')} initialMessage={initialMessage} />
            : <Landing onStart={handleStart} />
          }
        </div>
      </div>
    </div>
  );
}
