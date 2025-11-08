import { useEffect, useState } from 'react';
import './pages-css.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { loginUser } from '../services/authService.js';

export default function LoginPage({ onLogin, region, backendVersion }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [frontendVersion, setFrontendVersion] = useState('v0.1');

    // Загрузка версии фронтенда
    useEffect(() => {
        fetch('/frontend-version.json')
            .then((r) => r.json())
            .then((data) => {
                if (data?.version) setFrontendVersion(data.version);
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginUser(login, password);

            if (!result || result.isSuccess === false) {
                setError(result?.errorMessage || 'Неверный логин или пароль');
                return;
            }

            // Сохраняем токен
            if (result.token) {
                localStorage.setItem('token', result.token);
            }

            // Передаём данные в App
            if (onLogin) onLogin(result);

        } catch (err) {
            setError('Не удалось подключиться к серверу. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Топбар с версиями */}
            <div className="login-topbar">
                <div className="badge" id="region-badge">{region || 'Край/Область'}</div>
                <div className="badge" id="backend-version">backend {backendVersion || 'v0.1'}</div>
                <div className="badge" id="frontend-version">frontend {frontendVersion}</div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <h1 className="login-title">Навигационная панель</h1>

                {/* Логин */}
                <div className="input-row">
                    <div className="input-icon" aria-hidden="true">
                        <FaUser />
                    </div>
                    <div className="input-field">
                        <input
                            className="login-input"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Логин"
                            autoComplete="username"
                            required
                        />
                    </div>
                </div>

                {/* Пароль */}
                <div className="input-row">
                    <div className="input-icon" aria-hidden="true">
                        <FaLock />
                    </div>
                    <div className="input-field">
                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Вход…' : 'Войти'}
                </button>
            </form>
        </div>
    );
}