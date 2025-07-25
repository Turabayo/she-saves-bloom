import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { HashRouter } from 'react-router-dom'

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <HashRouter>
      <App />
      <Toaster />
    </HashRouter>
  </LanguageProvider>
);
