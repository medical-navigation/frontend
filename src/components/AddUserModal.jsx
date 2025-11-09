import { FaTimes, FaCheck } from 'react-icons/fa'

export default function AddUserModal({ open, value, hospitalOptions = [], onChange, onSave, onClose }) {
  if (!open) return null
  const safeValue = value || {}
  const {
    login = '',
    password = '',
    role = 0,
    hospitalId = '',
    hospitalName = ''
  } = safeValue

  const fallbackHospitalId = hospitalName
    ? hospitalOptions.find((opt) => opt.name === hospitalName)?.id || ''
    : ''
  const selectedHospitalId = hospitalId || fallbackHospitalId || ''
  const normalizedRole = Number.isFinite(Number(role)) ? Number(role) : 0

  const handleHospitalChange = (e) => {
    const nextId = e.target.value
    const selected = hospitalOptions.find((opt) => opt.id === nextId) || {}
    onChange({
      ...safeValue,
      hospitalId: nextId,
      medInstitutionId: nextId,
      hospitalName: selected.name || ''
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="side-header with-actions">
          <span>Новый сотрудник</span>
          <div className="actions">
            <button className="icon-btn success" title="Сохранить" type="button" onClick={onSave}>
              <FaCheck />
            </button>
            <button className="icon-btn danger" title="Закрыть" type="button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <div className="label">Логин</div>
            <input
              className="field-input outline"
              value={login}
              onChange={(e) => onChange({ ...safeValue, login: e.target.value })}
            />
          </div>
          <div className="form-group">
            <div className="label">Пароль</div>
            <input
              type="password"
              className="field-input outline"
              value={password}
              onChange={(e) => onChange({ ...safeValue, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <div className="label">Роль</div>
            <input
              type="number"
              min="0"
              className="field-input outline"
              value={normalizedRole}
              onChange={(e) => onChange({ ...safeValue, role: Number(e.target.value || 0) })}
            />
          </div>
          <div className="form-group">
            <div className="label">Медорганизация</div>
            {hospitalOptions.length ? (
              <select
                className="field-input outline"
                value={selectedHospitalId}
                onChange={handleHospitalChange}
              >
                {hospitalOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            ) : (
              <input
                className="field-input outline"
                value={hospitalName || ''}
                readOnly
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
