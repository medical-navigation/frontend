import { useEffect, useState } from 'react';
import './pages-css.css'
import { FaUser, FaLock, FaAmbulance, FaSearch, FaMapMarkerAlt, FaHospital, FaRegStickyNote } from 'react-icons/fa'

// Простая форма входа. Предполагается, что вы добавите реальный вызов API
// и сохранение токена/пользователя в Redux позже.
export default function LoginPage({ onLogin, region, backendVersion }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [frontendVersion, setFrontendVersion] = useState('v0.1');

  useEffect(() => {
    // Пробуем получить версию фронтенда из public/frontend-version.json
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
      // ВРЕМЕННО: эмитация запроса. Замените на реальный сервис авторизации.
      await new Promise((res) => setTimeout(res, 600));

      // На этапе входа не определяем права и роли — только передаём введённый логин.
      const authPayload = {
        login,
        token: 'mock-token'
      };

      if (onLogin) onLogin(authPayload);
    } catch (e) {
      setError('Не удалось выполнить вход. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Верхний левый угол: край/область и версии */}
      <div className="login-topbar">
        <div className="badge" id="region-badge">{region || 'Край/Область'}</div>
        <div className="badge" id="backend-version">backend {backendVersion || 'v0.1'}</div>
        <div className="badge" id="frontend-version">frontend {frontendVersion}</div>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Навигационная панель</h1>

        {/* Поле логина с иконкой */}
        <div className="input-row">
          <div className="input-icon" aria-hidden>
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

        {/* Поле пароля с иконкой */}
        <div className="input-row">
          <div className="input-icon" aria-hidden>
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
