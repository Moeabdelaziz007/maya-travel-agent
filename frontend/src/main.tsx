import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initTelegramWebApp } from './telegram-webapp'

// Initialize Telegram WebApp if running in Telegram
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  initTelegramWebApp();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
