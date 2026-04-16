import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<
    string,
    { default: ComponentType }
>;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) throw new Error(`Page not found: ${name}`);
        return page.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
