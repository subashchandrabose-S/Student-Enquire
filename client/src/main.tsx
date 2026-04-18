import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PublicApp from './PublicApp.tsx'



const isPublicPath = window.location.pathname === '/register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPublicPath ? <PublicApp /> : <App />}
  </StrictMode>,
)
