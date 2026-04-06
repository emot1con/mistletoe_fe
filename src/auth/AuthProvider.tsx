import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthTokens, clearAuthTokens, backendLogout, AUTH_ERROR_EVENT } from '../api/client';
import { AuthContext } from './AuthContext';

interface AuthTokens {
    access: string | null;
    refresh: string | null;
    userId: string | null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useState<AuthTokens>({ access: null, refresh: null, userId: null });
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = () => {
        const stored = getAuthTokens();
        setTokens(stored);
        setIsLoading(false);
    };

    useEffect(() => {
        const handleAuthError = () => {
            checkAuth();
        };

        window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
        checkAuth();

        return () => window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    }, []);

    const login = () => {
        const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
        const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8090/auth';
        window.location.href = `${AUTH_BASE}/github?redirect_url=${redirectUrl}`;
    };

    const logout = async () => {
        await backendLogout();
        clearAuthTokens();
        checkAuth();
    };

    const value = {
        isAuthenticated: !!tokens.access && !!tokens.userId,
        userId: tokens.userId,
        isLoading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
