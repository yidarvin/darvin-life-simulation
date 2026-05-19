import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { installTickLoop } from './game/state/tick';
import './index.css';

installTickLoop();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
