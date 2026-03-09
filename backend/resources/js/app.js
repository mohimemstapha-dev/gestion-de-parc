import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';

const container = document.getElementById('dashboard-root');
if (container) {
    const root = createRoot(container);
    root.render(<Dashboard />);
}
