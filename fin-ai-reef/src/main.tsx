//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback';
import { useAppTheme } from './hooks/use-theme';
import { ThemeContext } from './hooks/theme.context';
import { ClassModeProvider } from './hooks/use-class-mode';

import "./global.css"
import "./reef.css"

// Finn's AI Reef is open to children with NO login (safeguarding: children
// never authenticate). The Fabric AuthGate is intentionally not used here —
// only educators sign in later, on demand, via the "Sign in with Fabric"
// button (see ClassModeProvider / use-class-mode).
function Root() {
    const { isDark, toggleTheme } = useAppTheme();

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ClassModeProvider>
                    <App />
                </ClassModeProvider>
            </ErrorBoundary>
        </ThemeContext.Provider>
    );
}

createRoot(document.getElementById('root')!).render(<Root />)
