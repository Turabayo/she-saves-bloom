import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/LanguageContext'

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
    <Toaster />
  </LanguageProvider>
);
