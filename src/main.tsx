import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  const p = window.location.pathname || '';
  const h = window.location.hash || '';
  const s = window.location.search || '';
  const isPremiere = p.startsWith('/b/') || h.startsWith('#b/') || h.startsWith('#/b/') || s.includes('b=');
  if (isPremiere) {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
