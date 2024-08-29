import { Env, runPixel } from '@semoss/sdk';
import { InsightProvider } from '@semoss/sdk-react';

import { Router } from '@/pages';
import { Theme } from '@/components/common';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';
import { PIXELS } from './providers/pixels';

import { KnowledgebaseProvider } from '../src/contexts/FilesContext';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

if (process.env.NODE_ENV !== 'production') {
    Env.update({
        MODULE: process.env.MODULE || '',
        ACCESS_KEY: process.env.ACCESS_KEY || '',
        SECRET_KEY: process.env.SECRET_KEY || '',
    });
}

export const App = () => {
    return (
        <InsightProvider>
            <KnowledgebaseProvider>
                <RecoilRoot>
                    <Theme>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                            }}
                        />
                        <Router />
                    </Theme>
                </RecoilRoot>
            </KnowledgebaseProvider>
        </InsightProvider>
    );
};
