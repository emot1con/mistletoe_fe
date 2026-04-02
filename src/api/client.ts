const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8090/auth';

export const getAuthTokens = () => {
    return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token'),
        userId: localStorage.getItem('user_id')
    };
};

export const setAuthTokens = (access: string, refresh: string, userId: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_id', userId);
};

export const clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
};

export const refreshAccessToken = async (): Promise<boolean> => {
    const { refresh } = getAuthTokens();
    if (!refresh) return false;

    try {
        const response = await fetch(`${AUTH_BASE}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
        });

        const body = await response.json();
        
        if (response.ok && body.data?.tokens) {
            const { access_token, refresh_token } = body.data.tokens;
            const { userId } = getAuthTokens();
            setAuthTokens(access_token, refresh_token, userId as string);
            return true;
        }
    } catch (err) {
        console.error('Failed to refresh token', err);
    }
    return false;
};

interface FetchOptions extends RequestInit {
    _retry?: boolean;
}

export const apiFetch = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    let { access } = getAuthTokens();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {})
    };

    if (access) {
        headers['Authorization'] = `Bearer ${access}`;
    }

    let response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    // Handle 401 Unauthorized by attempting a token refresh
    if (response.status === 401 && !options._retry) {
        const success = await refreshAccessToken();
        if (success) {
            const newTokens = getAuthTokens();
            headers['Authorization'] = `Bearer ${newTokens.access}`;
            return apiFetch<T>(endpoint, { ...options, headers, _retry: true });
        } else {
            // Refresh failed, user needs to login again
            clearAuthTokens();
            window.location.href = '/login';
            throw new Error('Session expired');
        }
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data.data as T;
};

// Convenience methods
export const api = {
    get: <T>(url: string) => apiFetch<T>(url, { method: 'GET' }),
    post: <T>(url: string, body: any) => apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    delete: <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
};
