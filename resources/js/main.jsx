import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import '../css/app.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppRouter />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </StrictMode>
);
