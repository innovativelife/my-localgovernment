// frontend/src/App.tsx
import { useState } from 'react';
import './App.css';
import Landing from './components/Landing';
import Chat from './components/Chat';

type View = 'landing' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('landing');

  if (view === 'chat') {
    return <Chat onBack={() => setView('landing')} />;
  }
  return <Landing onStart={() => setView('chat')} />;
}
