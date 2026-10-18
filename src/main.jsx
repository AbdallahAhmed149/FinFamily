import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/i18n'
import { LanguageProvider } from '@/lib/LanguageContext'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
)