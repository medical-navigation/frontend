export async function apiRequest(url, method = 'GET', body = null, auth = true) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (auth) {
            const token = localStorage.getItem('token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || response.statusText);
        }

        // Если сервер вернул пустой ответ (204 No Content)
        if (response.status === 204) return null;

        return await response.json();
    } catch (err) {
        return {
            isSuccess: false,
            errorMessage: err.message,
            errorCode: "500"
        };
    }
}
