import { createContext } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    isLoading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    checkAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
