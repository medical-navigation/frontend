const rawBase = import.meta.env.VITE_BASE_URL || '';
let baseOrigin = null;
try {
    baseOrigin = rawBase.startsWith('http') ? new URL(rawBase).origin : null;
} catch {
    baseOrigin = null;
}

const normalizeUrl = (url) => {
    if (typeof window === 'undefined' || !baseOrigin) {
        return { url, useCredentials: false };
    }
    const isLocalFrontend = window.location.hostname === 'localhost';
    const isLocalBackend = baseOrigin === 'http://localhost:5000';
    if (isLocalFrontend && isLocalBackend && url.startsWith(baseOrigin)) {
        return { url: url.replace(baseOrigin, ''), useCredentials: true };
    }
    return { url, useCredentials: false };
};

export async function apiRequest(url, method = 'GET', body = null, auth = true) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (auth) {
            const token = localStorage.getItem('token');
            if (token) {
                const hasScheme = /^bearer\s+/i.test(token) || /^token\s+/i.test(token);
                headers['Authorization'] = hasScheme ? token : `Bearer ${token}`;
            }
        }

        const { url: requestUrl, useCredentials } = normalizeUrl(url);
        const fetchOptions = {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        };
        if (useCredentials) {
            fetchOptions.credentials = 'include';
        }

        const response = await fetch(requestUrl, fetchOptions);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || response.statusText);
        }

        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            const text = await response.text();
            return { result: text };
        }

    } catch (err) {
        return {
            isSuccess: false,
            errorMessage: err.message,
            errorCode: '500'
        };
    }
}
