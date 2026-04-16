import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        origin: 'http://127.0.0.1:5173',
        cors: {
            origin: [/^https?:\/\/localhost:8000$/, /^https?:\/\/127\.0\.0\.1:8000$/],
        },
        hmr: {
            host: '127.0.0.1',
            port: 5173,
        },
    },
});
