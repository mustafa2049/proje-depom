import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Yazı tipleri uygulamaya gömülüdür: internet olmadan da ikonlar ve metinler doğru görünür.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import 'material-symbols/outlined.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
