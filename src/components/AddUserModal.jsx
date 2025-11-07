import { FaTimes, FaCheck } from 'react-icons/fa'

export default function AddUserModal({ open, value, onChange, onSave, onClose }) {
  if (!open) return null
  const { email = '', password = '', hospital = '' } = value || {}

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="side-header with-actions">
          <span>Новый сотрудник</span>
          <div className="actions">
            <button className="icon-btn success" title="Сохранить" onClick={onSave}><FaCheck /></button>
            <button className="icon-btn danger" title="Закрыть" onClick={onClose}><FaTimes /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <div className="label">Электронная почта</div>
            <input className="field-input outline" value={email} onChange={(e)=>onChange({ ...value, email: e.target.value })} />
          </div>
          <div className="form-group">
            <div className="label">Пароль</div>
            <input type="password" className="field-input outline" value={password} onChange={(e)=>onChange({ ...value, password: e.target.value })} />
          </div>
          <div className="form-group">
            <div className="label">Медицинская организация</div>
            <input className="field-input outline" value={hospital} onChange={(e)=>onChange({ ...value, hospital: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  )
}
