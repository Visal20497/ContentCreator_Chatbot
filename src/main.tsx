import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorHandle from './pages/ErrorHandle';

ReactDOM.render(
    <React.StrictMode>
        <ErrorBoundary fallback={<ErrorHandle />}>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root'),
);
