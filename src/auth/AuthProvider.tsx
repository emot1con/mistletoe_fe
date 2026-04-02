import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthTokens, clearAuthTokens } from '../api/client';

interface AuthTokens {
    access: string | null;
    refresh: string | null;
    userId: string | null;
}

interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useState<AuthTokens>({ access: null, refresh: null, userId: null });
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = () => {
        const stored = getAuthTokens();
        setTokens(stored);
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = () => {
        const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
        const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8090/auth';
        window.location.href = `${AUTH_BASE}/github?redirect_url=${redirectUrl}`;
    };

    const logout = () => {
        clearAuthTokens();
        setTokens({ access: null, refresh: null, userId: null });
        window.location.href = '/login';
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
