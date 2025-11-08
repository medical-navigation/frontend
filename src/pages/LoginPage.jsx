import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './pages-css.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { loginUser } from '../services/authService.js';
import { login_success, login_fail } from '../redux/reducers/user.js';

const extractToken = (payload) => {
    if (!payload) return null;

    const normalize = (value) => {
        if (typeof value !== 'string') return null;
        const trimmed = value.trim().replace(/^"|"$/g, '');
        return trimmed.length ? trimmed : null;
    };

    if (typeof payload === 'string') {
        return normalize(payload);
    }

    const tokenCandidates = [
        payload.token,
        payload.accessToken,
        payload.jwt,
        payload.jwtToken,
        payload?.data?.token,
        payload?.data?.accessToken,
        payload?.data?.jwt,
        payload?.data?.jwtToken,
        payload?.result?.token,
        payload?.result?.accessToken,
        payload?.result?.jwt,
        payload?.result?.jwtToken,
        payload.result,
        payload.data
    ];

    for (const candidate of tokenCandidates) {
        const normalized = normalize(candidate);
        if (normalized) return normalized;
    }

    if (typeof payload?.result === 'object') {
        const nested = extractToken(payload.result);
        if (nested) return nested;
    }
    if (typeof payload?.data === 'object') {
        const nested = extractToken(payload.data);
        if (nested) return nested;
    }

    return null;
};

export default function LoginPage({ onLogin, region, backendVersion }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [frontendVersion, setFrontendVersion] = useState('v0.1');
    const dispatch = useDispatch();

    // Загружаем версию фронтенда
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
                dispatch(login_fail());
                setError(result?.errorMessage || 'Неверный логин или пароль');
                return;
            }

            const token = extractToken(result);
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }

            const userPayload =
                result?.user
                || result?.data?.user
                || {
                    login: result?.login ?? result?.data?.login ?? login,
                    hospitalName: result?.hospitalName ?? result?.data?.hospitalName ?? '',
                    role: result?.role ?? result?.data?.role ?? 'user'
                };

            dispatch(login_success(userPayload));

            // Передаём данные в App (если логика всё ещё нужна)
            if (onLogin) onLogin(result);

        } catch (err) {
            dispatch(login_fail());
            setError('Не удалось связаться с сервером. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Бейджи в хедере */}
            <div className="login-topbar">
                <div className="badge" id="region-badge">{region || 'Регион не указан'}</div>
                <div className="badge" id="backend-version">backend {backendVersion || 'v0.1'}</div>
                <div className="badge" id="frontend-version">frontend {frontendVersion}</div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <h1 className="login-title">Административная панель</h1>

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
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
}
