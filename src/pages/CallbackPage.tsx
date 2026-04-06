import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthTokens } from '../api/client';
import { useAuth } from '../auth/useAuth';

export const CallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const uid = searchParams.get('uid');

        if (accessToken && refreshToken && uid) {
            setAuthTokens(accessToken, refreshToken, uid);
            checkAuth(); // Update global auth context
            navigate('/', { replace: true });
        } else {
            console.error('Missing tokens in callback URL');
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-dark text-white">
            <div className="text-center animate-fade">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-heading mb-2">Authenticating...</h2>
                <p className="text-text-muted">Securely logging you into Mistletoe.</p>
            </div>
        </div>
    );
};
