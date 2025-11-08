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

        // Сервер может вернуть 204 No Content — тогда тела нет
        if (response.status === 204) return null;

        // Проверяем тип контента, чтобы корректно разобрать ответ
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            // Если это просто строка (например, токен)
            const text = await response.text();
            return { result: text };
        }

    } catch (err) {
        return {
            isSuccess: false,
            errorMessage: err.message,
            errorCode: "500"
        };
    }
}
