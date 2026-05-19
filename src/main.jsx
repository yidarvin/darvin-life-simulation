import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { installTickLoop } from './game/state/tick';
import { useGameStore, installPeriodicSave, flushSave } from './game/state/store';
import { load } from './game/state/persistence';
import './index.css';

// Load saved state (if any) before React renders, so the first paint shows
// real values rather than a flash of defaults.
const loaded = load();
useGameStore.getState()._hydrate(loaded);

installTickLoop();
installPeriodicSave();

window.addEventListener('beforeunload', flushSave);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
